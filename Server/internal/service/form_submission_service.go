package service

import (
	"fmt"

	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/repository"
	"github.com/luneto10/voting-system/internal/validation"
	"gorm.io/gorm"
)

type FormSubmissionService interface {
	SubmitForm(formID uint, userID uint, answers []dto.AnswerSubmission) (*model.Submission, error)
	UserSubmittedForm(formID uint, userID uint) (bool, error)
	GetFormVoters(formID uint, userID uint) ([]*model.Submission, error)
}

type FormSubmissionServiceImpl struct {
	formRepository       repository.FormRepository
	formService          FormService
	authorizationService FormAuthorizationService
}

func NewFormSubmissionService(
	formRepository repository.FormRepository,
	formService FormService,
	authorizationService FormAuthorizationService,
) FormSubmissionService {
	return &FormSubmissionServiceImpl{
		formRepository:       formRepository,
		formService:          formService,
		authorizationService: authorizationService,
	}
}

func (s *FormSubmissionServiceImpl) SubmitForm(formID uint, userID uint, answers []dto.AnswerSubmission) (*model.Submission, error) {
	// First, verify that the form exists
	form, err := s.formService.GetForm(formID)
	if err != nil {
		return nil, ErrFormNotFound
	}

	// Check authorization to submit form
	if err := s.authorizationService.CanSubmitForm(userID, formID); err != nil {
		return nil, err
	}

	// Create a map for faster question lookup
	questionMap := make(map[uint]*model.Question)
	for i := range form.Questions {
		questionMap[form.Questions[i].ID] = &form.Questions[i]
	}

	// Create the submission
	submission := &model.Submission{
		FormID: form.ID,
		UserID: userID,
	}

	// Convert answers and validate question types
	modelAnswers := make([]model.Answer, len(answers))
	for i, answer := range answers {
		question, exists := questionMap[answer.QuestionID]
		if !exists {
			return nil, fmt.Errorf("question with ID %d not found in form", answer.QuestionID)
		}

		if err := validation.ValidateAnswer(question, answer); err != nil {
			return nil, err
		}

		modelAnswer := model.Answer{
			QuestionID: answer.QuestionID,
			Text:       &answer.Text,
		}

		if len(answer.OptionIDs) > 0 {
			options := make([]model.Option, len(answer.OptionIDs))
			for j, optionID := range answer.OptionIDs {
				options[j] = model.Option{
					Model: gorm.Model{ID: optionID},
				}
			}
			modelAnswer.Options = options
		}

		modelAnswers[i] = modelAnswer
	}

	submission.Answers = modelAnswers

	if err := s.formRepository.CreateSubmission(submission); err != nil {
		return nil, err
	}

	return submission, nil
}

func (s *FormSubmissionServiceImpl) UserSubmittedForm(formID uint, userID uint) (bool, error) {
	submitted, err := s.formRepository.UserSubmittedForm(userID, formID)
	if err != nil {
		return false, err
	}
	return submitted, nil
}

func (s *FormSubmissionServiceImpl) GetFormVoters(formID uint, userID uint) ([]*model.Submission, error) {
	if err := s.authorizationService.CanViewFormResults(userID, formID); err != nil {
		return nil, err
	}

	return s.formRepository.GetFormVoters(formID)
}

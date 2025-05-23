package service

import (
	"fmt"

	"github.com/jinzhu/copier"
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/repository"
	"github.com/luneto10/voting-system/internal/validation"
	"gorm.io/gorm"
)

type FormService interface {
	CreateForm(f *model.Form) (*model.Form, error)
	GetForm(id uint) (*model.Form, error)
	UpdateForm(id uint, updateForm *dto.UpdateFormRequest) (*model.Form, error)
	SubmitForm(formID uint, userID uint, answers []dto.AnswerSubmission) (*model.Submission, error)
	UserSubmittedForm(formID uint, userID uint) (bool, error)
}

type FormServiceImpl struct {
	formRepository repository.FormRepository
}

func NewFormService(formRepository repository.FormRepository) FormService {
	return &FormServiceImpl{formRepository: formRepository}
}

func (s *FormServiceImpl) CreateForm(f *model.Form) (*model.Form, error) {
	if err := s.formRepository.CreateForm(f); err != nil {
		return nil, err
	}
	return f, nil
}

func (s *FormServiceImpl) GetForm(id uint) (*model.Form, error) {
	form, err := s.formRepository.GetForm(id)
	if err != nil {
		return nil, ErrFormNotFound
	}
	return form, nil
}

func (s *FormServiceImpl) UpdateForm(id uint, updateForm *dto.UpdateFormRequest) (*model.Form, error) {
	originalForm, err := s.GetForm(id)
	if err != nil {
		return nil, ErrFormNotFound
	}

	if err := copier.Copy(&originalForm, &updateForm); err != nil {
		return nil, err
	}

	if err := s.formRepository.UpdateForm(id, originalForm); err != nil {
		return nil, err
	}
	return originalForm, nil
}

func (s *FormServiceImpl) SubmitForm(formID uint, userID uint, answers []dto.AnswerSubmission) (*model.Submission, error) {
	// First, verify that the form exists
	form, err := s.GetForm(formID)
	if err != nil {
		return nil, ErrFormNotFound
	}

	//Check if user has already submitted the form
	submitted, err := s.formRepository.UserSubmittedForm(userID, form.ID)
	if err != nil {
		return nil, err
	}
	if submitted {
		return nil, ErrSubmissionAlreadyExists
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

func (s *FormServiceImpl) UserSubmittedForm(formID uint, userID uint) (bool, error) {
	submitted, err := s.formRepository.UserSubmittedForm(userID, formID)
	if err != nil {
		return false, err
	}
	return submitted, nil
}


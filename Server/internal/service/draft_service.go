package service

import (
	"encoding/json"
	"time"

	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/repository"
)

type DraftService interface {
	SaveDraft(userID uint, formID uint, req *dto.SaveDraftRequest) (*model.DraftSubmission, error)
	GetDraft(userID uint, formID uint) (*dto.DraftSubmissionResponse, error)
	DeleteDraft(userID uint, formID uint) error
	CalculateProgress(formID uint, answers []dto.AnswerSubmission) (float64, error)
}

type DraftServiceImpl struct {
	draftRepository repository.DraftRepository
	formRepository  repository.FormRepository
}

func NewDraftService(
	draftRepository repository.DraftRepository,
	formRepository repository.FormRepository,
) DraftService {
	return &DraftServiceImpl{
		draftRepository: draftRepository,
		formRepository:  formRepository,
	}
}

func (s *DraftServiceImpl) SaveDraft(userID uint, formID uint, req *dto.SaveDraftRequest) (*model.DraftSubmission, error) {
	progress, err := s.CalculateProgress(formID, req.Answers)
	if err != nil {
		return nil, err
	}

	answersJSON, err := json.Marshal(req.Answers)
	if err != nil {
		return nil, err
	}

	existingDraft, err := s.draftRepository.GetDraft(formID, userID)
	if err == nil {
		existingDraft.Answers = answersJSON
		existingDraft.ProgressPercentage = progress
		existingDraft.UpdatedAt = time.Now()

		if err := s.draftRepository.SaveDraft(existingDraft); err != nil {
			return nil, err
		}
		return existingDraft, nil
	}

	draft := &model.DraftSubmission{
		FormID:             formID,
		UserID:             userID,
		Answers:            answersJSON,
		ProgressPercentage: progress,
	}

	if err := s.draftRepository.SaveDraft(draft); err != nil {
		return nil, err
	}

	return draft, nil
}

func (s *DraftServiceImpl) GetDraft(userID uint, formID uint) (*dto.DraftSubmissionResponse, error) {
	draft, err := s.draftRepository.GetDraft(formID, userID)
	if err != nil {
		return nil, err
	}

	var answers []dto.AnswerSubmission
	if err := json.Unmarshal(draft.Answers, &answers); err != nil {
		return nil, err
	}

	// Get form data
	form, err := s.formRepository.GetForm(formID)
	if err != nil {
		return nil, err
	}

	response := &dto.DraftSubmissionResponse{
		ID:                 draft.ID,
		FormID:             draft.FormID,
		UserID:             draft.UserID,
		FormTitle:          form.Title,
		FormDescription:    form.Description,
		LastModified:       draft.UpdatedAt,
		ProgressPercentage: draft.ProgressPercentage,
		Answers:            answers,
	}

	return response, nil
}

func (s *DraftServiceImpl) DeleteDraft(userID uint, formID uint) error {
	return s.draftRepository.DeleteDraft(formID, userID)
}

func (s *DraftServiceImpl) CalculateProgress(formID uint, answers []dto.AnswerSubmission) (float64, error) {
	form, err := s.formRepository.GetForm(formID)
	if err != nil {
		return 0, err
	}

	totalQuestions := len(form.Questions)
	if totalQuestions == 0 {
		return 0, nil
	}

	answeredQuestions := 0
	for _, answer := range answers {
		if len(answer.OptionIDs) > 0 || answer.Text != "" {
			answeredQuestions++
		}
	}

	progress := float64(answeredQuestions) / float64(totalQuestions) * 100
	return progress, nil
}

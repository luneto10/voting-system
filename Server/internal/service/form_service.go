package service

import (
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/repository"
)

type FormService interface {
	CreateForm(f *model.Form) (*model.Form, error)
	GetForm(id uint) (*model.Form, error)
	UpdateForm(id uint, userID uint, updateForm *dto.UpdateFormRequest) (*model.Form, error)
	DeleteForm(id uint, userID uint) error
	GetFormsByUserID(userID uint) ([]*model.Form, error)
}

type FormServiceImpl struct {
	formRepository       repository.FormRepository
	authorizationService FormAuthorizationService
}

func NewFormService(
	formRepository repository.FormRepository,
	authorizationService FormAuthorizationService,
) FormService {
	return &FormServiceImpl{
		formRepository:       formRepository,
		authorizationService: authorizationService,
	}
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

func (s *FormServiceImpl) UpdateForm(id uint, userID uint, updateForm *dto.UpdateFormRequest) (*model.Form, error) {
	if err := s.authorizationService.CanViewFormResults(userID, id); err != nil {
		return nil, err
	}

	originalForm, err := s.GetForm(id)
	if err != nil {
		return nil, ErrFormNotFound
	}

	// Handle deleted questions
	if len(updateForm.DeletedQuestionIds) > 0 {
		for _, questionID := range updateForm.DeletedQuestionIds {
			if err := s.formRepository.DeleteQuestion(questionID); err != nil {
		return nil, err
			}
		}
	}

	// Update form fields
	if updateForm.Title != nil {
		originalForm.Title = *updateForm.Title
	}
	if updateForm.Description != nil {
		originalForm.Description = *updateForm.Description
	}
	if updateForm.StartAt != nil {
		originalForm.StartAt = *updateForm.StartAt
	}
	if updateForm.EndAt != nil {
		originalForm.EndAt = *updateForm.EndAt
	}

	// Update questions
	if updateForm.Questions != nil {
		questions := make([]model.Question, len(updateForm.Questions))
		for i, q := range updateForm.Questions {
			question := model.Question{
				Title: *q.Title,
				Type:  model.QuestionType(*q.Type),
			}
			if q.ID != nil {
				question.ID = *q.ID
			}

			// Update options
			if q.Options != nil {
				options := make([]*model.Option, len(q.Options))
				for j, o := range q.Options {
					option := &model.Option{
						Title: o.Title,
					}
					if o.ID != nil {
						option.ID = *o.ID
					}
					options[j] = option
				}
				question.Options = options
			}
			questions[i] = question
		}
		originalForm.Questions = questions
	}

	if err := s.formRepository.UpdateForm(id, originalForm); err != nil {
		return nil, err
	}
	return originalForm, nil
}

func (s *FormServiceImpl) DeleteForm(id uint, userID uint) error {
	if err := s.authorizationService.CanViewFormResults(userID, id); err != nil {
		return err
	}

	return s.formRepository.DeleteForm(id)
}

func (s *FormServiceImpl) GetFormsByUserID(userID uint) ([]*model.Form, error) {
	return s.formRepository.GetFormsByUserID(userID)
}

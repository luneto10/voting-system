package service

import (
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/repository"
)

type FormService struct {
	formRepository *repository.FormRepository
}

func NewFormService(formRepository *repository.FormRepository) *FormService {
	return &FormService{formRepository: formRepository}
}

func (s *FormService) CreateForm(f *model.Form) (*model.Form, error) {

	if len(f.Title) < 5 {
		return nil, ErrInvalidTitle
	}

	if err := s.formRepository.CreateForm(f); err != nil {
		return nil, err
	}
	return f, nil
}

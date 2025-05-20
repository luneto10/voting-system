package service

import (
	"github.com/jinzhu/copier"
	"github.com/luneto10/voting-system/api/dto"
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
	if err := s.formRepository.CreateForm(f); err != nil {
		return nil, err
	}
	return f, nil
}

func (s *FormService) GetForm(id string) (*model.Form, error) {
	form, err := s.formRepository.GetForm(id)
	if err != nil {
		return nil, ErrFormNotFound
	}
	return form, nil
}

func (s *FormService) UpdateForm(id string, updateForm *dto.UpdateFormRequest) (*model.Form, error) {
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

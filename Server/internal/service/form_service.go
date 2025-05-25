package service

import (
	"github.com/jinzhu/copier"
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

	if err := copier.Copy(&originalForm, &updateForm); err != nil {
		return nil, err
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

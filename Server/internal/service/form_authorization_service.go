package service

import "github.com/luneto10/voting-system/internal/repository"

type FormAuthorizationService interface {
	IsFormOwner(userID uint, formID uint) (bool, error)
	CanSubmitForm(userID uint, formID uint) error
	CanViewFormResults(userID uint, formID uint) error
}

type FormAuthorizationServiceImpl struct {
	formRepository repository.FormRepository
}

func NewFormAuthorizationService(formRepository repository.FormRepository) FormAuthorizationService {
	return &FormAuthorizationServiceImpl{formRepository: formRepository}
}

func (s *FormAuthorizationServiceImpl) IsFormOwner(userID uint, formID uint) (bool, error) {
	return s.formRepository.IsFormOwner(userID, formID)
}

func (s *FormAuthorizationServiceImpl) CanSubmitForm(userID uint, formID uint) error {
	// Check if user is trying to submit their own form
	isOwner, err := s.IsFormOwner(userID, formID)
	if err != nil {
		return err
	}
	if isOwner {
		return ErrCannotSubmitOwnForm
	}

	// Check if user has already submitted the form
	submitted, err := s.formRepository.UserSubmittedForm(userID, formID)
	if err != nil {
		return err
	}
	if submitted {
		return ErrSubmissionAlreadyExists
	}

	return nil
}

func (s *FormAuthorizationServiceImpl) CanViewFormResults(userID uint, formID uint) error {
	isOwner, err := s.IsFormOwner(userID, formID)
	if err != nil {
		return err
	}
	if !isOwner {
		return ErrNotFormOwner
	}
	return nil
}

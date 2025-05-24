package repository

import (
	"github.com/luneto10/voting-system/api/model"
	"gorm.io/gorm"
)

type FormRepository interface {
	CreateForm(form *model.Form) error
	GetForm(id uint) (*model.Form, error)
	UpdateForm(id uint, form *model.Form) error
	DeleteForm(id uint) error
	GetFormsByUserID(userID uint) ([]*model.Form, error)
	IsFormOwner(userID uint, formID uint) (bool, error)
	CreateSubmission(submission *model.Submission) error
	GetSubmissionByID(id uint) (*model.Submission, error)
	GetSubmissionsByFormID(formID uint) ([]*model.Submission, error)
	GetSubmissionsByUserID(userID uint) ([]*model.Submission, error)
	UserSubmittedForm(userID uint, formID uint) (bool, error)
}

type FormRepositoryImpl struct {
	db *gorm.DB
}

func NewFormRepository(db *gorm.DB) FormRepository {
	return &FormRepositoryImpl{db: db}
}

func (r *FormRepositoryImpl) CreateForm(form *model.Form) error {
	return r.db.Create(form).Error
}

func (r *FormRepositoryImpl) GetForm(id uint) (*model.Form, error) {
	var form model.Form
	if err := r.db.
		Preload("Questions.Options").
		Preload("User").
		First(&form, id).Error; err != nil {
		return nil, err
	}
	return &form, nil
}

func (r *FormRepositoryImpl) UpdateForm(id uint, form *model.Form) error {
	return r.db.Save(form).Error
}

func (r *FormRepositoryImpl) DeleteForm(id uint) error {
	return r.db.Delete(&model.Form{}, id).Error
}

func (r *FormRepositoryImpl) GetFormsByUserID(userID uint) ([]*model.Form, error) {
	var forms []*model.Form
	if err := r.db.
		Preload("Questions.Options").
		Where("user_id = ?", userID).
		Find(&forms).Error; err != nil {
		return nil, err
	}
	return forms, nil
}

func (r *FormRepositoryImpl) IsFormOwner(userID uint, formID uint) (bool, error) {
	var form model.Form
	if err := r.db.
		Select("id").
		Where("id = ? AND user_id = ?", formID, userID).
		First(&form).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *FormRepositoryImpl) CreateSubmission(submission *model.Submission) error {
	return r.db.Create(submission).Error
}

func (r *FormRepositoryImpl) GetSubmissionByID(id uint) (*model.Submission, error) {
	var submission model.Submission
	if err := r.db.
		Preload("Answers").
		First(&submission, id).Error; err != nil {
		return nil, err
	}
	return &submission, nil
}

func (r *FormRepositoryImpl) GetSubmissionsByFormID(formID uint) ([]*model.Submission, error) {
	var submissions []*model.Submission
	if err := r.db.
		Preload("Answers").
		First(&submissions, &model.Submission{FormID: formID}).Error; err != nil {
		return nil, err
	}
	return submissions, nil
}

func (r *FormRepositoryImpl) GetSubmissionsByUserID(userID uint) ([]*model.Submission, error) {
	var submissions []*model.Submission
	if err := r.db.
		Preload("Answers").
		First(&submissions, &model.Submission{UserID: userID}).Error; err != nil {
		return nil, err
	}
	return submissions, nil
}

func (r *FormRepositoryImpl) UserSubmittedForm(userID uint, formID uint) (bool, error) {
	var submission model.Submission
	if err := r.db.
		Where("user_id = ? AND form_id = ?", userID, formID).
		First(&submission).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

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
	GetFormVoters(formID uint) ([]*model.Submission, error)
	UserSubmittedForm(userID uint, formID uint) (bool, error)
	DeleteQuestion(id uint) error
	DeleteOption(id uint) error
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
	// Start a transaction
	tx := r.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Update all user form participations to 'deleted' status
	if err := tx.Model(&model.UserFormParticipation{}).
		Where("form_id = ?", id).
		Update("status", "deleted").Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete all submissions for this form
	if err := tx.Where("form_id = ?", id).Delete(&model.Submission{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete all questions and their options
	if err := tx.Where("form_id = ?", id).Delete(&model.Question{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Finally delete the form
	if err := tx.Delete(&model.Form{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	return tx.Commit().Error
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
		Preload("User").
		Where("form_id = ?", formID).
		Find(&submissions).Error; err != nil {
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

func (r *FormRepositoryImpl) GetFormVoters(formID uint) ([]*model.Submission, error) {
	var submissions []*model.Submission

	// First get all submissions
	if err := r.db.
		Preload("User").
		Where("form_id = ?", formID).
		Find(&submissions).Error; err != nil {
		return nil, err
	}

	// Then get all in-progress users
	var inProgressUsers []*model.UserFormParticipation
	if err := r.db.
		Preload("User").
		Where("form_id = ? AND status = 'in_progress'", formID).
		Find(&inProgressUsers).Error; err != nil {
		return nil, err
	}

	// Convert in-progress users to submissions format
	for _, participation := range inProgressUsers {
		submissions = append(submissions, &model.Submission{
			UserID: participation.UserID,
			FormID: participation.FormID,
			User:   participation.User,
		})
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

func (r *FormRepositoryImpl) DeleteQuestion(id uint) error {
	return r.db.Delete(&model.Question{}, id).Error
}

func (r *FormRepositoryImpl) DeleteOption(id uint) error {
	return r.db.Delete(&model.Option{}, id).Error
}

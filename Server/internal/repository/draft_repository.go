package repository

import (
	"github.com/luneto10/voting-system/api/model"
	"gorm.io/gorm"
)

type DraftRepository interface {
	SaveDraft(draft *model.DraftSubmission) error
	GetDraft(formID uint, userID uint) (*model.DraftSubmission, error)
	DeleteDraft(formID uint, userID uint) error
	GetUserDrafts(userID uint) ([]*model.DraftSubmission, error)
}

type DraftRepositoryImpl struct {
	db *gorm.DB
}

func NewDraftRepository(db *gorm.DB) DraftRepository {
	return &DraftRepositoryImpl{db: db}
}

func (r *DraftRepositoryImpl) SaveDraft(draft *model.DraftSubmission) error {
	return r.db.Save(draft).Error
}

func (r *DraftRepositoryImpl) GetDraft(formID uint, userID uint) (*model.DraftSubmission, error) {
	var draft model.DraftSubmission
	if err := r.db.
		Preload("Form").
		Where("form_id = ? AND user_id = ?", formID, userID).
		First(&draft).Error; err != nil {
		return nil, err
	}
	return &draft, nil
}

func (r *DraftRepositoryImpl) DeleteDraft(formID uint, userID uint) error {
	return r.db.
		Where("form_id = ? AND user_id = ?", formID, userID).
		Delete(&model.DraftSubmission{}).Error
}

func (r *DraftRepositoryImpl) GetUserDrafts(userID uint) ([]*model.DraftSubmission, error) {
	var drafts []*model.DraftSubmission
	if err := r.db.
		Preload("Form").
		Where("user_id = ?", userID).
		Find(&drafts).Error; err != nil {
		return nil, err
	}
	return drafts, nil
}

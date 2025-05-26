package repository

import (
	"time"

	"github.com/luneto10/voting-system/api/model"
	"gorm.io/gorm"
)

type DashboardRepository interface {
	GetUserFormParticipation(userID uint, formID uint) (*model.UserFormParticipation, error)
	UpdateUserFormParticipation(participation *model.UserFormParticipation) error
	CreateUserFormParticipation(participation *model.UserFormParticipation) error
	GetUserFormsWithParticipation(userID uint) ([]*model.Form, error)
	GetUserFormStatistics(userID uint) (available, inProgress, completed, recentActivity int, err error)
	GetUserRecentActivity(userID uint, limit int) ([]*model.UserFormParticipation, error)
	SearchForms(query string, userID uint) ([]*model.Form, error)
}

type DashboardRepositoryImpl struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) DashboardRepository {
	return &DashboardRepositoryImpl{db: db}
}

func (r *DashboardRepositoryImpl) GetUserFormParticipation(userID uint, formID uint) (*model.UserFormParticipation, error) {
	var participation model.UserFormParticipation
	err := r.db.
		Where("user_id = ? AND form_id = ?", userID, formID).
		First(&participation).Error
	if err != nil {
		return nil, err
	}
	return &participation, nil
}

func (r *DashboardRepositoryImpl) UpdateUserFormParticipation(participation *model.UserFormParticipation) error {
	return r.db.Save(participation).Error
}

func (r *DashboardRepositoryImpl) CreateUserFormParticipation(participation *model.UserFormParticipation) error {
	return r.db.Create(participation).Error
}

func (r *DashboardRepositoryImpl) GetUserFormsWithParticipation(userID uint) ([]*model.Form, error) {
	var forms []*model.Form

	// Get all forms with their participation status for the user
	err := r.db.
		Preload("Questions").
		Joins("LEFT JOIN user_form_participations ON forms.id = user_form_participations.form_id AND user_form_participations.user_id = ?", userID).
		Where("forms.start_at <= ? AND forms.end_at >= ? OR user_form_participations.user_id = ?", time.Now(), time.Now(), userID).
		Find(&forms).Error

	return forms, err
}

func (r *DashboardRepositoryImpl) GetUserFormStatistics(userID uint) (available, inProgress, completed, recentActivity int, err error) {
	now := time.Now()

	var availableCount, inProgressCount, completedCount, recentActivityCount int64

	err = r.db.Model(&model.Form{}).
		Joins("LEFT JOIN user_form_participations ON forms.id = user_form_participations.form_id AND user_form_participations.user_id = ?", userID).
		Joins("LEFT JOIN submissions ON forms.id = submissions.form_id AND submissions.user_id = ?", userID).
		Where("forms.start_at <= ? AND forms.end_at >= ?", now, now).
		Where("submissions.id IS NULL").
		Where("user_form_participations.status IS NULL OR user_form_participations.status = 'available'").
		Count(&availableCount).Error
	if err != nil {
		return 0, 0, 0, 0, err
	}

	err = r.db.Model(&model.UserFormParticipation{}).
		Where("user_id = ? AND status = 'in_progress'", userID).
		Count(&inProgressCount).Error
	if err != nil {
		return 0, 0, 0, 0, err
	}

	// Completed forms
	err = r.db.Model(&model.UserFormParticipation{}).
		Where("user_id = ? AND status = 'completed'", userID).
		Count(&completedCount).Error
	if err != nil {
		return 0, 0, 0, 0, err
	}

	// Recent activity (last 30 days)
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	err = r.db.Model(&model.UserFormParticipation{}).
		Where("user_id = ? AND last_modified >= ?", userID, thirtyDaysAgo).
		Count(&recentActivityCount).Error

	return int(availableCount), int(inProgressCount), int(completedCount), int(recentActivityCount), err
}

func (r *DashboardRepositoryImpl) GetUserRecentActivity(userID uint, limit int) ([]*model.UserFormParticipation, error) {
	var activities []*model.UserFormParticipation
	err := r.db.
		Preload("Form").
		Where("user_id = ?", userID).
		Order("last_modified DESC").
		Limit(limit).
		Find(&activities).Error

	return activities, err
}

func (r *DashboardRepositoryImpl) SearchForms(query string, userID uint) ([]*model.Form, error) {
	var forms []*model.Form
	now := time.Now()

	err := r.db.
		Preload("Questions.Options").
		Where("title ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Where("start_at <= ? AND end_at >= ?", now, now).
		Find(&forms).Error

	return forms, err
}

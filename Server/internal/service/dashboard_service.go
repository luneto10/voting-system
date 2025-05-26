package service

import (
	"time"

	"github.com/jinzhu/copier"
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/repository"
	"gorm.io/gorm"
)

type DashboardService interface {
	GetDashboardData(userID uint) (*dto.DashboardData, error)
	UpdateUserFormStatus(userID uint, formID uint, status string) error
}

type DashboardServiceImpl struct {
	dashboardRepository repository.DashboardRepository
	draftRepository     repository.DraftRepository
	formRepository      repository.FormRepository
}

func NewDashboardService(
	dashboardRepository repository.DashboardRepository,
	draftRepository repository.DraftRepository,
	formRepository repository.FormRepository,
) DashboardService {
	return &DashboardServiceImpl{
		dashboardRepository: dashboardRepository,
		draftRepository:     draftRepository,
		formRepository:      formRepository,
	}
}

func (s *DashboardServiceImpl) GetDashboardData(userID uint) (*dto.DashboardData, error) {
	// Get statistics
	available, inProgress, completed, recentActivity, err := s.dashboardRepository.GetUserFormStatistics(userID)
	if err != nil {
		return nil, err
	}

	statistics := dto.DashboardStatistics{
		TotalAvailable:      available,
		TotalCompleted:      completed,
		TotalInProgress:     inProgress,
		RecentActivityCount: recentActivity,
	}

	// Get recent activity
	activities, err := s.dashboardRepository.GetUserRecentActivity(userID, 5)
	if err != nil {
		return nil, err
	}

	recentActivityList := make([]dto.DashboardActivity, len(activities))
	for i, activity := range activities {
		// Use copier for basic fields
		if err := copier.Copy(&recentActivityList[i], activity); err != nil {
			return nil, err
		}

		// Set fields that need special handling
		recentActivityList[i].FormTitle = activity.Form.Title
		recentActivityList[i].FormDescription = activity.Form.Description
		recentActivityList[i].StartAt = activity.Form.StartAt
		recentActivityList[i].EndAt = activity.Form.EndAt
	}

	// Get forms with participation status
	forms, err := s.GetUserFormsWithStatus(userID)
	if err != nil {
		return nil, err
	}

	dashboardData := &dto.DashboardData{
		Statistics:     statistics,
		RecentActivity: recentActivityList,
		Forms:          forms,
	}

	return dashboardData, nil
}

func (s *DashboardServiceImpl) GetUserFormsWithStatus(userID uint) ([]dto.DashboardForm, error) {
	forms, err := s.dashboardRepository.GetUserFormsWithParticipation(userID)
	if err != nil {
		return nil, err
	}

	var dashboardForms []dto.DashboardForm
	for _, form := range forms {
		// Get participation status
		participation, err := s.dashboardRepository.GetUserFormParticipation(userID, form.ID)
		var status string
		var startedAt, completedAt, lastModified *time.Time
		var progress float64

		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, err
		}

		if participation != nil {
			status = participation.Status
			startedAt = participation.StartedAt
			completedAt = participation.CompletedAt
			lastModified = &participation.LastModified
		} else {
			// Check if form is available
			now := time.Now()
			if form.StartAt.Before(now) && form.EndAt.After(now) {
				status = "available"
			} else {
				continue // Skip inactive forms
			}
		}

		// Get draft progress if in progress
		if status == "in_progress" {
			draft, err := s.draftRepository.GetDraft(form.ID, userID)
			if err == nil {
				progress = draft.ProgressPercentage
				lastModified = &draft.UpdatedAt
			}
		}

		// Use copier for basic form fields
		dashboardForm := dto.DashboardForm{}
		if err := copier.Copy(&dashboardForm, form); err != nil {
			return nil, err
		}

		// Set dashboard-specific fields
		dashboardForm.FormID = form.ID
		dashboardForm.FormTitle = form.Title
		dashboardForm.FormDescription = form.Description
		dashboardForm.Status = status
		dashboardForm.StartedAt = startedAt
		dashboardForm.CompletedAt = completedAt
		dashboardForm.LastModified = lastModified
		dashboardForm.ProgressPercentage = progress
		dashboardForm.StartAt = form.StartAt
		dashboardForm.EndAt = form.EndAt

		dashboardForms = append(dashboardForms, dashboardForm)
	}

	return dashboardForms, nil
}

func (s *DashboardServiceImpl) UpdateUserFormStatus(userID uint, formID uint, status string) error {
	participation, err := s.dashboardRepository.GetUserFormParticipation(userID, formID)

	if err != nil && err != gorm.ErrRecordNotFound {
		return err
	}

	now := time.Now()

	if participation == nil {
		// Create new participation record
		newParticipation := &model.UserFormParticipation{
			FormID:       formID,
			UserID:       userID,
			Status:       status,
			LastModified: now,
		}

		if status == "in_progress" {
			newParticipation.StartedAt = &now
		} else if status == "completed" {
			newParticipation.CompletedAt = &now
		}

		return s.dashboardRepository.CreateUserFormParticipation(newParticipation)
	}

	// Update existing participation
	participation.Status = status
	participation.LastModified = now

	if status == "in_progress" && participation.StartedAt == nil {
		participation.StartedAt = &now
	} else if status == "completed" {
		participation.CompletedAt = &now
	}

	return s.dashboardRepository.UpdateUserFormParticipation(participation)
}

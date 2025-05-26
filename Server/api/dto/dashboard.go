package dto

import "time"

// Dashboard Statistics Response
type DashboardStatistics struct {
	TotalAvailable      int `json:"total_available"`
	TotalCompleted      int `json:"total_completed"`
	TotalInProgress     int `json:"total_in_progress"`
	RecentActivityCount int `json:"recent_activity_count"`
}

// Dashboard Recent Activity
type DashboardActivity struct {
	FormID          uint       `json:"form_id"`
	FormTitle       string     `json:"form_title"`
	FormDescription string     `json:"form_description"`
	Status          string     `json:"status"`
	CompletedAt     *time.Time `json:"completed_at,omitempty"`
	StartAt         time.Time  `json:"startAt"`
	EndAt           time.Time  `json:"endAt"`
}

// Dashboard Form
type DashboardForm struct {
	FormID             uint       `json:"form_id"`
	FormTitle          string     `json:"form_title"`
	FormDescription    string     `json:"form_description"`
	Status             string     `json:"status"` // available, in_progress, completed
	StartedAt          *time.Time `json:"started_at,omitempty"`
	CompletedAt        *time.Time `json:"completed_at,omitempty"`
	LastModified       *time.Time `json:"last_modified,omitempty"`
	ProgressPercentage float64    `json:"progress_percentage"`
	StartAt            time.Time  `json:"startAt"`
	EndAt              time.Time  `json:"endAt"`
}

// Dashboard Data Response
type DashboardData struct {
	Statistics     DashboardStatistics `json:"statistics"`
	RecentActivity []DashboardActivity `json:"recent_activity"`
	Forms          []DashboardForm     `json:"forms"`
}

type DashboardResponse struct {
	Statistics     DashboardStatistics `json:"statistics"`
	RecentActivity []DashboardActivity `json:"recent_activity"`
	Forms          []DashboardForm     `json:"forms"`
}

// Search Forms Response
type SearchFormResult struct {
	ID          uint                  `json:"id"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	StartAt     time.Time             `json:"startAt"`
	EndAt       time.Time             `json:"endAt"`
	Questions   []GetQuestionResponse `json:"questions"`
}

type SearchFormsResponse struct {
	ID          uint                  `json:"id"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	StartAt     time.Time             `json:"startAt"`
	EndAt       time.Time             `json:"endAt"`
	Questions   []GetQuestionResponse `json:"questions"`
}

// Draft Submission DTOs
type SaveDraftRequest struct {
	FormID  uint               `json:"form_id" binding:"required"`
	Answers []AnswerSubmission `json:"answers" binding:"required"`
}

type DraftSubmissionResponse struct {
	ID                 uint               `json:"id"`
	FormID             uint               `json:"form_id"`
	UserID             uint               `json:"user_id"`
	FormTitle          string             `json:"form_title"`
	FormDescription    string             `json:"form_description"`
	LastModified       time.Time          `json:"last_modified"`
	ProgressPercentage float64            `json:"progress_percentage"`
	Answers            []AnswerSubmission `json:"answers"`
}

type GetDraftResponse struct {
	ID                 uint               `json:"id"`
	FormID             uint               `json:"form_id"`
	UserID             uint               `json:"user_id"`
	FormTitle          string             `json:"form_title"`
	FormDescription    string             `json:"form_description"`
	LastModified       time.Time          `json:"last_modified"`
	ProgressPercentage float64            `json:"progress_percentage"`
	Answers            []AnswerSubmission `json:"answers"`
}

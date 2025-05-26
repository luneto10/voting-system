package dto

import "time"

type UpdateFormRequest struct {
	Title              *string                 `json:"title" binding:"omitempty,min=5,max=100"`
	Description        *string                 `json:"description" binding:"omitempty"`
	StartAt            *time.Time              `json:"startAt" binding:"omitempty"`
	EndAt              *time.Time              `json:"endAt" binding:"omitempty"`
	Questions          []UpdateQuestionRequest `json:"questions" binding:"omitempty,dive"`
	DeletedQuestionIds []uint                  `json:"deletedQuestionIds" binding:"omitempty"`
}

type UpdateQuestionRequest struct {
	ID      *uint                 `json:"id" binding:"omitempty"`
	Title   *string               `json:"title" binding:"omitempty"`
	Type    *string               `json:"type" binding:"omitempty"`
	Options []UpdateOptionRequest `json:"options" binding:"omitempty,dive"`
}

type UpdateOptionRequest struct {
	ID    *uint  `json:"id" binding:"omitempty"`
	Title string `json:"title" binding:"omitempty"`
}

type GetFormResponse struct {
	ID          uint                  `json:"id"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	StartAt     time.Time             `json:"startAt"`
	EndAt       time.Time             `json:"endAt"`
	CreatedAt   time.Time             `json:"createdAt"`
	UserID      uint                  `json:"user_id"`
	Questions   []GetQuestionResponse `json:"questions"`
}

type GetPublicFormResponse struct {
	ID          uint                  `json:"id"`
	Title       string                `json:"title"`
	Description string                `json:"description"`
	StartAt     time.Time             `json:"startAt"`
	EndAt       time.Time             `json:"endAt"`
	Questions   []GetQuestionResponse `json:"questions"`
}

type GetQuestionResponse struct {
	ID      uint                `json:"id"`
	Title   string              `json:"title"`
	Type    string              `json:"type"`
	Options []GetOptionResponse `json:"options"`
}

type GetOptionResponse struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
}

type CreateFormRequest struct {
	Title       string                  `json:"title" binding:"required,min=5,max=100"`
	Description *string                 `json:"description"`
	StartAt     *time.Time              `json:"startAt" binding:"omitempty"`
	EndAt       *time.Time              `json:"endAt" binding:"omitempty"`
	Questions   []CreateQuestionRequest `json:"questions" binding:"required,dive"`
}

type CreateQuestionRequest struct {
	Title   string                `json:"title" binding:"required"`
	Type    string                `json:"type" binding:"required,oneof=single_choice multiple_choice text"`
	Options []CreateOptionRequest `json:"options,omitempty"`
}

type CreateOptionRequest struct {
	Title string `json:"title" binding:"required"`
}

type SubmitFormRequest struct {
	Answers []AnswerSubmission `json:"answers" binding:"required"`
}

type AnswerSubmission struct {
	QuestionID uint   `json:"question_id" binding:"required"`
	OptionIDs  []uint `json:"option_ids,omitempty"`
	Text       string `json:"text,omitempty"`
}

type SubmitFormResponse struct {
	ID          uint      `json:"id"`
	FormID      uint      `json:"form_id"`
	UserID      uint      `json:"user_id"`
	CompletedAt time.Time `json:"completed_at"`
}

type FormVoterResponse struct {
	ID           uint       `json:"id"`
	UserID       uint       `json:"user_id"`
	Email        string     `json:"email"`
	CompletedAt  *time.Time `json:"completed_at,omitempty"`
	Status       string     `json:"status"` // available, in_progress, completed
	LastModified *time.Time `json:"last_modified,omitempty"`
}

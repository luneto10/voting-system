package dto

import "time"

type UpdateFormRequest struct {
	Title *string `json:"title" binding:"omitempty,min=5,max=100"`
}

type GetFormResponse struct {
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

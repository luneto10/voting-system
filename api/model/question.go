package model

import "gorm.io/gorm"

type QuestionType string 

const (
	QuestionTypeSingleChoice QuestionType = "single_choice"
	QuestionTypeMultipleChoice QuestionType = "multiple_choice"
	QuestionTypeText QuestionType = "text"
)

type Question struct {
	gorm.Model
	Title string `gorm:"not null"`
	Type  QuestionType `gorm:"not null"`
	Options []*Option `gorm:"many2many:question_options;"`
}
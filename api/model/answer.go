package model

import "gorm.io/gorm"

type Answer struct {
	gorm.Model
	QuestionID uint
	Question   Question
	Options    []*Option `gorm:"many2many:answer_options;"`
	Text       *string
}

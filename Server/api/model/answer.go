package model

import "gorm.io/gorm"

type Answer struct {
	gorm.Model
	SubmissionID uint       `gorm:"not null;index"`
	Submission   Submission `gorm:"foreignKey:SubmissionID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	QuestionID   uint       `gorm:"not null;index"`
	Question     Question   `gorm:"foreignKey:QuestionID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Text         *string    `gorm:"type:text"`
	Options      []Option   `gorm:"many2many:answer_options;"`
}

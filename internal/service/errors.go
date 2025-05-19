package service

import "errors"

var (
	ErrInvalidTitle = errors.New("title must be at least 5 characters long")
	ErrFormNotFound = errors.New("form not found")
)

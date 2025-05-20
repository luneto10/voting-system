package service

import "errors"

var (
	ErrInvalidTitle = errors.New("title must be at least 5 characters long")
	ErrFormNotFound = errors.New("form not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
)

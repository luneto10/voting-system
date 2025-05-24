package service

import "errors"

var (
	ErrInvalidTitle            = errors.New("title must be at least 5 characters long")
	ErrFormNotFound            = errors.New("form not found")
	ErrUserAlreadyExists       = errors.New("user already exists")
	ErrInvalidCredentials      = errors.New("invalid credentials")
	ErrInvalidForm             = errors.New("invalid form")
	ErrInvalidToken            = errors.New("invalid token")
	ErrSubmissionAlreadyExists = errors.New("user has already submitted the form")
	ErrUserNotFound            = errors.New("user not found")
	ErrNotFormOwner            = errors.New("user is not the owner of this form")
	ErrCannotSubmitOwnForm     = errors.New("user cannot submit their own form")
)

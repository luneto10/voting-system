package service

import (
	"errors"
)

// Form errors
var (
	ErrInvalidTitle = errors.New("title must be at least 5 characters long")
)

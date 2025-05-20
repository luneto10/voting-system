package service

import (
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/helper"
	"github.com/luneto10/voting-system/internal/helper/auth"
	"github.com/luneto10/voting-system/internal/repository"
	"gorm.io/gorm"
)

type AuthService struct {
	userRepository *repository.UserRepository
}

func NewAuthService(userRepository *repository.UserRepository) *AuthService {
	return &AuthService{userRepository: userRepository}
}

func (s *AuthService) Register(user *model.User) (*model.User, error) {
	// Check if user already exists
	existingUser, err := s.userRepository.GetUserByEmail(user.Email)
	// If error is not gorm.ErrRecordNotFound, return error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// If user already exists, return error
	if existingUser != nil {
		return nil, ErrUserAlreadyExists
	}

	// Hash password
	if user.Password, err = helper.HashPassword(user.Password); err != nil {
		return nil, err
	}

	// Create user
	if err := s.userRepository.CreateUser(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) Login(email, password string) (*model.User, string, error) {
	user, err := s.userRepository.GetUserByEmail(email)
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	if err := helper.ComparePassword(user.Password, password); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	// TODO: Generate token
	token, err := auth.GenerateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

package service

import (
	"time"

	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/helper"
	"github.com/luneto10/voting-system/internal/helper/auth"
	"github.com/luneto10/voting-system/internal/repository"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(user *model.User) (*model.User, error)
	Login(email, password string) (*model.User, string, string, error)
	RefreshToken(refreshToken string) (string, error)
	Logout(refreshToken string) error
	GetUserByEmail(email string) (*model.User, error)
}

type AuthServiceImpl struct {
	userRepository         repository.UserRepository
	refreshTokenRepository repository.RefreshTokenRepository
}

func NewAuthService(
	userRepo repository.UserRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
) AuthService {
	return &AuthServiceImpl{
		userRepository:         userRepo,
		refreshTokenRepository: refreshTokenRepo,
	}
}

func (s *AuthServiceImpl) Register(user *model.User) (*model.User, error) {
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

// Login handles user login and returns both JWT and refresh token
func (s *AuthServiceImpl) Login(email, password string) (*model.User, string, string, error) {
	// Get user by email
	user, err := s.userRepository.GetUserByEmail(email)
	if err != nil {
		return nil, "", "", ErrInvalidCredentials
	}

	// Verify password
	if err := helper.ComparePassword(user.Password, password); err != nil {
		return nil, "", "", ErrInvalidCredentials
	}

	// Generate JWT
	jwtToken, err := auth.GenerateJWT(user)
	if err != nil {
		return nil, "", "", err
	}

	// Generate refresh token
	refreshToken, err := auth.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, "", "", err
	}

	// Save refresh token to database
	refreshTokenModel := &model.RefreshToken{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(auth.RefreshTokenExpiration),
	}
	if err := s.refreshTokenRepository.CreateRefreshToken(refreshTokenModel); err != nil {
		return nil, "", "", err
	}

	return user, jwtToken, refreshToken, nil
}

func (s *AuthServiceImpl) RefreshToken(refreshToken string) (string, error) {
	// Get refresh token from database
	storedToken, err := s.refreshTokenRepository.GetRefreshTokenByToken(refreshToken)
	if err != nil {
		return "", ErrInvalidToken
	}

	// Check if token is revoked or expired
	if storedToken.Revoked || auth.IsRefreshTokenExpired(storedToken.ExpiresAt) {
		return "", ErrInvalidToken
	}

	// Get user
	user, err := s.userRepository.GetUserByID(storedToken.UserID)
	if err != nil {
		return "", err
	}

	// Generate new JWT
	newJWT, err := auth.GenerateJWT(user)
	if err != nil {
		return "", err
	}

	return newJWT, nil
}

func (s *AuthServiceImpl) Logout(refreshToken string) error {
	return s.refreshTokenRepository.RevokeRefreshToken(refreshToken)
}

func (s *AuthServiceImpl) GetUserByEmail(email string) (*model.User, error) {
	user, err := s.userRepository.GetUserByEmail(email)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

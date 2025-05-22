package repository

import (
	"github.com/luneto10/voting-system/api/model"
	"gorm.io/gorm"
)

type RefreshTokenRepository interface {
	CreateRefreshToken(token *model.RefreshToken) error
	GetRefreshTokenByToken(token string) (*model.RefreshToken, error)
	DeleteRefreshToken(token string) error
	RevokeRefreshToken(token string) error
}

type RefreshTokenRepositoryImpl struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepositoryImpl {
	return &RefreshTokenRepositoryImpl{db: db}
}

func (r *RefreshTokenRepositoryImpl) CreateRefreshToken(token *model.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *RefreshTokenRepositoryImpl) GetRefreshTokenByToken(token string) (*model.RefreshToken, error) {
	var refreshToken model.RefreshToken
	if err := r.db.Where(&model.RefreshToken{Token: token}).First(&refreshToken).Error; err != nil {
		return nil, err
	}
	return &refreshToken, nil
}

func (r *RefreshTokenRepositoryImpl) DeleteRefreshToken(token string) error {
	return r.db.Where(&model.RefreshToken{Token: token}).Delete(&model.RefreshToken{}).Error
}

func (r *RefreshTokenRepositoryImpl) RevokeRefreshToken(token string) error {
	return r.db.Model(&model.RefreshToken{}).Where(&model.RefreshToken{Token: token}).Update("revoked", true).Error
}

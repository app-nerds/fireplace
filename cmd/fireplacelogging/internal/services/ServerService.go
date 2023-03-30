package services

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/jackskj/carta"
)

type ServerServiceConfig struct {
	DB *sql.DB
}

type ServerService struct {
	db *sql.DB
}

func NewServerService(config ServerServiceConfig) *ServerService {
	return &ServerService{
		db: config.DB,
	}
}

func (s *ServerService) Delete(id uint, memberID string) error {
	var (
		err error
	)

	query := `
		UPDATE servers SET
			deleted_at = $1
		WHERE id = $2
			AND member_id = $3
	`

	if _, err = s.db.Exec(query, time.Now().UTC(), id, memberID); err != nil {
		return err
	}

	return nil
}

func (s *ServerService) Get(id uint, memberID string) (model.Server, error) {
	var (
		err  error
		rows *sql.Rows
	)

	result := model.Server{}

	query := `
		SELECT
			servers.id AS server_id,
			servers.created_at AS server_created_at,
			servers.updated_at AS server_updated_at,
			servers.deleted_at AS server_deleted_at,
			servers.description AS server_description,
			servers.password AS server_password,
			servers.server_name AS server_name,
			servers.url AS server_url
		FROM servers
		WHERE 
			servers.id = $1
			AND servers.member_id = $2
			AND servers.deleted_at IS NULL
	`

	if rows, err = s.db.Query(query, id, memberID); err != nil {
		return result, err
	}

	records := []model.Server{}

	if err = carta.Map(rows, &records); err != nil {
		return result, err
	}

	if len(records) <= 0 {
		return result, sql.ErrNoRows
	}

	return records[0], nil
}

func (s *ServerService) Save(server model.Server, memberID string) (int64, error) {
	var (
		err   error
		newID int64
	)

	server.Member.ID = memberID

	if server.ID > 0 {
		err = s.update(server)
		newID = int64(server.ID)
	} else {
		newID, err = s.create(server)
	}

	if err != nil {
		return 0, err
	}

	return newID, nil
}

func (s *ServerService) Search(memberID string) ([]model.Server, error) {
	var (
		err  error
		rows *sql.Rows
	)

	result := []model.Server{}

	query := `
		SELECT
			servers.id AS server_id,
			servers.created_at AS server_created_at,
			servers.updated_at AS server_updated_at,
			servers.deleted_at AS server_deleted_at,
			servers.description AS server_description,
			servers.password AS server_password,
			servers.server_name AS server_name,
			servers.url AS server_url,
			members.id AS member_id
		FROM servers
			INNER JOIN members ON members.id = servers.member_id
		WHERE 1=1
			AND servers.member_id = $1
			AND servers.deleted_at IS NULL
	`

	rows, err = s.db.Query(query, memberID)

	if errors.Is(err, sql.ErrNoRows) {
		return result, nil
	}

	if err != nil {
		return result, err
	}

	if err = carta.Map(rows, &result); err != nil {
		return result, fmt.Errorf("error mapping rows to struct: %w", err)
	}

	return result, nil
}

func (s *ServerService) create(newServer model.Server) (int64, error) {
	var (
		err    error
		result sql.Result
	)

	query := `
		INSERT INTO servers (
			created_at,
			description,
			password,
			server_name,
			url,
			member_id
		) VALUES (
			$1,
			$2,
			$3,
			$4,
			$5,
			$6
		)
	`

	result, err = s.db.Exec(query, time.Now().UTC(), newServer.Description, newServer.Password, newServer.ServerName, newServer.URL, newServer.Member.ID)

	if err != nil {
		return 0, err
	}

	newID, _ := result.LastInsertId()
	return newID, nil
}

func (s *ServerService) update(updatedServer model.Server) error {
	var (
		err error
	)

	query := `
		UPDATE servers SET 
			updated_at = $1,
			description = $2,
			password = $3,
			server_name = $4,
			url = $5
		WHERE 
			id = $6
			AND member_id = $7
	`

	_, err = s.db.Exec(query, time.Now().UTC(), updatedServer.Description, updatedServer.Password, updatedServer.ServerName, updatedServer.URL, updatedServer.ID, updatedServer.Member.ID)
	return err
}

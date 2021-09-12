package pkg

/*
GenericResponse is used to communicate a message back to
the caller.
*/
type GenericResponse struct {
	Message string `json:"message"`
}

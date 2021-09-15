/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package pkg

/*
GenericResponse is used to communicate a message back to
the caller.
*/
type GenericResponse struct {
	Message string `json:"message"`
}

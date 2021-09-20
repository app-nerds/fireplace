# Fireplace Server

Fireplace Server is a Go application that runs an HTTP server for capturing
and serving up structured log entries. 

## Getting Started

To begin, ensure you have [Go 1.16+](https://golang.org/dl/) installed. To compile
the server application, perform the following on the terminal.

```bash
git git@github.com:app-nerds/fireplace.git
cd fireplace/cmd/fireplace-server
go get
go build
```

## Configuring
Fireplace Server allows for configuring both via command line flag and an environment file. The following are command line arguments that can be used to customize how the Fireplace Server runs.

* **FIREPLACE_SERVER_HOST** - IP/Port to bind to. Defaults to *localhost:8999*
* **FIREPLACE_SERVER_LOGLEVEL** - What level to write logs at. Defaults to *debug*
* **FIREPLACE_SERVER_CERT** - Path and name to *.crt* and *.key* files. This should be the filename with no extension. When provided this server will run over SSL. When empty the server will run without SSL
* **FIREPLACE_SERVER_PASSWORD** - Password for accessing and writing to this server
* **FIREPLACE_PAGE_SIZE** - Number of records to return per page. Defaults to 100
* **FIREPLACE_DATABASE_URL** - URL to a MongoDB database. Default is *mongodb://localhost:27017*
* **FIREPLACE_CLEAN_LOG_INTERVAL_DAYS** - How many days to keep log entries before they are deleted
* **FIREPLACE_CLEAN_LOG_SCHEDULE** - String telling Fireplace Server the schedule with which to delete log entries. This string should be formatted in [CRON format](https://crontab.guru)

### Example
```
$ ./fireplace-server -FIREPLACE_SERVER_HOST=127.0.0.1:8080
```

### Environment File
In the root of this repository is a sample environment file named **env.template**. In it you will find a sample configuration for all the variables listed above.

## Capturing Logs in a Go Application
To capture logs in your Go applications using Logurs and Fireplace, ensure you are importing
Logrus and the Fireplace hook. Here is a small sample of logging to Fireplace Server.

```
package main

import (
    "github.com/app-nerds/fireplace/v2/cmd/fireplace-hook"
    "github.com/sirupsen/logrus"
)

func main() {
    logger := logrus.New()
    logger.AddHook(fireplacehook.NewFireplaceHook(&fireplacehook.FireplaceHookConfig{
        Application: "Sample Application",
        FireplaceURL: "http://localhost:8999"
			Password: "password",
    }))

    logger.WithField("someKey", "someValue").Infof("This is a log entry!")
}
```

## Fireplace Server API

The following documents the API for working with a Fireplace Server. Note that all endpoints request an *Authorization* header with the server password provided. For example:

```text
Authorization: Bearer password
```

### Capturing A Log Entry
This is the main function of Fireplace Server. Application call this endpoint to capture log entries into the database.

#### POST: /logentry

#### Payload
A log entry consists of a body in JSON format, with a content type of **application/json**.
The body must look something like this.

```json
{
   "application": "My Application",
   "details": [
      {
         "key": "useful",
         "value": "value"
      }
   ],
   "level": "info",
   "message": "My log message!",
   "time": "2018-07-04T09:39:05Z07:00"
}
```

The payload must be configured in this way. The *details* key can be an
empty array, and not required to contain any values. This key is used
to provide arbitrary key/value pairs of additional data.

*level* must be one of the following:

* debug
* warning
* info
* error
* fatal
* panic

#### Response
Upon successful capture a *200* status code and the new log entry **ID** will be returned.

### Getting Captured Log Entries

#### GET: /logentry

#### Query Parameters
* **page** - Page number of records to retrieve. 1-based. *Required*
* **application** - Filter results by application name. *Optional*
* **level** - Filter results by level of severity. Must be one of the following: *debug*, *warning*, *info*, *error*, *fatal*, *panic*. *Optional*
* **search** - Filter results by a search term. This will apply against the log message. *Optional*

#### Response
Upon return the payload will return a structure which contains the total count of records, the number of records in this response, the size of a page, and the collection of matching log entries. Here is a sample.

```json
{
   "count": 10,
   "logEntries": [
      {
         "application": "Create Test Entries 1",
         "details": [
            {
               "key": "additional",
               "value": "Additional 1"
            },
            {
               "key": "who",
               "value": "Main Process"
            }
         ],
         "id": "5b3cde7a85db9e2b16aa4aae",
         "level": "info",
         "message": "This is test message 1",
         "time": "2018-07-04T09:49:30-05:00"
      },
      {
         "application": "Create Test Entries 1",
         "details": [
            {
               "key": "additional",
               "value": "Additional 3"
            },
            {
               "key": "who",
               "value": "Main Process"
            }
         ],
         "id": "5b3cde7a85db9e2b16aa4ab2",
         "level": "error",
         "message": "This is error 1",
         "time": "2018-07-04T09:49:30-05:00"
      }
  ],
   "pageSize": 100,
   "totalCount": 10
}
```

### Getting a Single Log Entry

#### GET: /logentry/:id

#### Path Parameters
* **id** - ID of the log entry to retrieve

#### Response
Upon return the payload will return a structure which contains the specified log entry. Here is a sample:

```json
{
    "application": "Create Test Entries 1",
    "details": [
    {
        "key": "additional",
        "value": "Additional 1"
    },
    {
        "key": "who",
        "value": "Main Process"
    }
    ],
    "id": "5b3cde7a85db9e2b16aa4aae",
    "level": "info",
    "message": "This is test message 1",
    "time": "2018-07-04T09:49:30-05:00"
}
```

### Deleting Log Entries

#### DELETE: /logentry

#### Query Parameters
* **fromDate** - Date in the format of *MM/DD/YYYY*. All log entries from this date back will be deleted

#### Response
A message detailing how many log entries were deleted. For example ```10 entries deleted```

### Getting Application Names
Retrieve a list of application names captured in log entries. When an application writes a log entry to Fireplace Server it provides an application name. This endpoint returns a list of those names.

#### GET: /applicationname

#### Response
An array of application names.

```
[
    "application name 1",
    "application name 2"
]
```

## License
MIT License

Copyright (c) 2021 App Nerds LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

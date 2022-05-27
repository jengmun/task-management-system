# 1. Authentication - applied to ALL routes

**Data example** All fields must be sent together with the request body of the respective routes

```json
{
  "username": "username",
  "password": "password",
  "acronym": "APP",
  "taskID": "APP_4"
}
```

## Error Responses

<!-- Authentication -->

**Condition** : If username or password are not entered.

**Code** : `400 BAD REQUEST`

**Content**

```json
{
  "success": false,
  "message": "Please enter all authentication details"
}
```

### Or

**Condition** : If user does not exist.

**Code** : `401 UNAUTHORISED`

**Content** :

```json
{
  "success": false,
  "message": "Invalid user"
}
```

### Or

**Condition** : If user is inactive.

**Code** : `401 UNAUTHORISED`

**Content** :

```json
{
  "success": false,
  "message": "Inactive user"
}
```

### Or

**Condition** : If password is invalid.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "success": false,
  "message": "Invalid password"
}
```

# 2. Create a new task

**URL** : `/task/a3/create-task`

**Method** : `POST`

**Auth required** : YES

**Permissions required** : Team Lead (Default)

**Data constraints**

```json
{
  "acronym": "VARCHAR(3)",
  "planName": "VARCHAR(45)",
  "taskName": "VARCHAR(45)",
  "description": "VARCHAR(255)"
}
```

**Data example** All fields must be sent except for planName. Remove field if not used.

http://localhost:5000/task/a3/create-task

```json
{
  "username": "username",
  "password": "password",
  "acronym": "APP",
  "planName": "Release 1",
  "taskName": "Task 1",
  "description": "Task description"
}
```

## Success Response

**Condition** : If everything is OK.

**Code** : `201 CREATED`

**Content example**

```json
{
  "message": "Task created"
}
```

## Error Responses

<!-- Task Permissions -->

**Condition** : If Acronym not sent.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "success": false,
  "message": "Please input an app acronym"
}
```

### Or

**Condition** : If length of acronym is not 3 characters.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "success": false,
  "message": "Length of acronym must be 3 characters!"
}
```

### Or

**Condition** : If user does not have permissions to create task.

**Code** : `401 UNAUTHORISED`

**Content** :

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Or

<!-- Create task -->

**Condition** : If taskName or description are missed.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "success": false,
  "message": "Please input both task name and description!"
}
```

### Or

**Condition** : If plan name is invalid or closed.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "success": false,
  "message": "No valid open plan found!"
}
```

### Or

**Condition** : If server error.

**Code** : `500 INTERNAL SERVER ERROR`

**Content example**

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

# 3. Retrieve tasks in a particular state

**URL** : `/task/a3/all-tasks/:app/:state`

**Method** : `POST`

**Auth required** : YES

**Permissions required** : NO

**Data constraints**

App is 3 characters long.

Available states:

1. Open
2. Todo
3. Doing
4. Done
5. Closed

**Data example**

All fields must be sent.

http://localhost:5000/task/a3/all-tasks/APP/Open

1. Request Parameters

```json
{
  "app": "APP",
  "state": "Open"
}
```

2. Request Body

```json
{
  "username": "username",
  "password": "password"
}
```

## Success Response

**Condition** : If there are tasks in that state for that app

**Code** : `200 OK`

**Content example**

```json
[
  {
    "task_id": "APP_11",
    "task_name": "Task 1",
    "description": "task",
    "plan_name": null,
    "acronym": "APP",
    "state": "Done",
    "creator": "admin",
    "owner": "User13",
    "create_date": "2022-05-09T01:21:47.000Z",
    "notes": "[{\"details\":\"Task updated from Doing to Done\",\"timestamp\":\"2022-05-23 9:58:45 am\",\"creator\":\"11\",\"state\":\"Done\",\"taskID\":\"APP_11\"},{\"details\":\"fda\",\"timestamp\":\"2022-05-18 5:43:09 pm\",\"creator\":\"13\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"fda\",\"timestamp\":\"2022-05-18 5:41:40 pm\",\"creator\":\"admin\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Todo to Doing\",\"timestamp\":\"2022-05-18 5:41:30 pm\",\"creator\":\"11\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Doing to Todo\",\"timestamp\":\"2022-05-18 5:41:25 pm\",\"creator\":\"11\",\"state\":\"Todo\",\"taskID\":\"APP_11\"},{\"details\":\"fdas\",\"timestamp\":\"2022-05-18 5:26:06 pm\",\"creator\":\"13\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"fdsa\",\"timestamp\":\"2022-05-18 5:26:04 pm\",\"creator\":\"13\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"new note\",\"timestamp\":\"2022-05-18 5:21:08 pm\",\"creator\":\"admin\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Todo to Doing\",\"timestamp\":\"2022-05-18 5:08:40 pm\",\"creator\":\"12\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Doing to Todo\",\"timestamp\":\"2022-05-18 5:07:11 pm\",\"creator\":\"13\",\"state\":\"Todo\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Done to Doing\",\"timestamp\":\"2022-05-18 5:07:09 pm\",\"creator\":\"13\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Doing to Done\",\"timestamp\":\"2022-05-18 5:07:01 pm\",\"creator\":\"13\",\"state\":\"Done\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Done to Doing\",\"timestamp\":\"2022-05-18 5:06:58 pm\",\"creator\":\"13\",\"state\":\"Doing\",\"taskID\":\"APP_11\"},{\"details\":\"Task updated from Doing to Done\",\"date\":\"2022-05-17T02:10:52.972Z\",\"creator\":\"admin\",\"state\":\"Done\",\"taskID\":\"APP_11\"},{\"details\":\"notes\",\"date\":\"2022-05-13T02:12:43.735Z\",\"creator\":\"13\",\"state\":\"Doing\",\"taskID\":\"APP_11\"}]"
  }
]
```

### Or

**Condition** : If there are no tasks in that state for that app

**Code** : `200 OK`

**Content** : `[]`

## Error Responses

**Condition** : If either app or state parameter is not sent

**Code** : `404 NOT FOUND`

**Content** :

```json
{
  "success": false,
  "message": "/task/a3/all-tasks/APP route not found"
}
```

### Or

**Condition** : If server error.

**Code** : `500 INTERNAL SERVER ERROR`

**Content example**

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

# 4. Approve a task from "Doing to Done" state

**URL** : `/task/a3/approve-done-task`

**Method** : `POST`

**Auth required** : YES

**Permissions required** : Developer (Default)

**Data constraints**

```json
{
  "acronym": "VARCHAR(3)",
  "taskID": "ACRONYM_RUNNING NUMBER"
}
```

**Data example** All fields must be sent.

http://localhost:5000/task/a3/approve-done-task

```json
{
  "username": "username",
  "password": "password",
  "acronym": "APP",
  "taskID": "APP_4"
}
```

## Success Response

**Condition** : If task successfully promoted.

**Code** : `201 CREATED`

**Content example**

```json
{
  "message": "Task updated from Doing to Done"
}
```

## Error Responses

<!-- Task Permissions -->

**Condition** : If Task ID does not exist.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "success": false,
  "message": "Invalid Task ID"
}
```

### Or

**Condition** : If Acronym not sent.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "success": false,
  "message": "Please input an app acronym"
}
```

### Or

**Condition** : If length of acronym is not 3 characters.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "success": false,
  "message": "Length of acronym must be 3 characters!"
}
```

### Or

**Condition** : If user does not have permissions to promote task.

**Code** : `401 UNAUTHORISED`

**Content** :

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Or

<!-- Task Progression -->

**Condition** : If current state of the task is not `Doing`.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "success": false,
  "message": "Current state is not Doing!"
}
```

### Or

**Condition** : If server error.

**Code** : `500 INTERNAL SERVER ERROR`

**Content example**

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

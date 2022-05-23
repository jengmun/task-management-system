# 1. Create a new task

**URL** : `/task/a3/create-task`

**Method** : `POST`

**Auth required** : YES

**Permissions required** : Team Lead

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
  "id": 123,
  "name": "Build something project dot com",
  "url": "http://testserver/api/accounts/123/"
}
```

## Error Responses

**Condition** : If Account already exists for User.

**Code** : `303 SEE OTHER`

**Headers** : `Location: http://testserver/api/accounts/123/`

**Content** : `{}`

### Or

**Condition** : If fields are missed.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

# 2. Retrieve tasks in a particular state

**URL** : `/task/a3/all-tasks/:app/:state`

**Method** : `POST`

**Auth required** : YES

**Permissions required** : Member of the application

**Data constraints**

Available states:

1. Open
2. Todo
3. Doing
4. Done
5. Closed

**Data example**

All fields must be sent.

http://localhost:5000/task/a3/all-tasks/APP/Open

```json
{
  "username": "username",
  "password": "password"
}
```

## Success Response

**Condition** : If everything is OK.

**Code** : `201 CREATED`

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

## Error Responses

**Condition** : If Account already exists for User.

**Code** : `303 SEE OTHER`

**Headers** : `Location: http://testserver/api/accounts/123/`

**Content** : `{}`

### Or

**Condition** : If fields are missed.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

# 3. Approve a task from "Doing to Done" state

**URL** : `/task/a3/approve-done-task`

**Method** : `POST`

**Auth required** : YES

**Permissions required** : Team Lead

**Data constraints**

```json
{
  "acronym": "VARCHAR(3)",
  "taskID": "ACRONYM_RUNNING NUMBER"
}
```

**Data example** All fields must be sent except for planName. Remove field if not used.

```json
{
  "username": "username",
  "password": "password",
  "acronym": "APP",
  "taskID": "APP_4"
}
```

## Success Response

**Condition** : If everything is OK.

**Code** : `201 CREATED`

**Content example**

```json
{
  "id": 123,
  "name": "Build something project dot com",
  "url": "http://testserver/api/accounts/123/"
}
```

## Error Responses

**Condition** : If Task ID does not exist.

**Code** : `303 SEE OTHER`

**Headers** : `Location: http://testserver/api/accounts/123/`

**Content** : `{}`

### Or

**Condition** : If fields are missed.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

### Or

**Condition** : If insufficient permissions.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

### Or

**Condition** : If username and password are not entered.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

### Or

**Condition** : If user does not exist.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

### Or

**Condition** : If user is inactive.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

### Or

**Condition** : If password is invalid.

**Code** : `400 BAD REQUEST`

**Content example**

```json
{
  "name": ["This field is required."]
}
```

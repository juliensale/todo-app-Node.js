# Node.js & GraphQL ToDo App 

## Intro

This project is a reproduction of an app I first created with Django.

My objective was to get familiar with Node.js by creating an API with things like **user authentication**, different **model relationships** and **custom methods**. As well as setting up the **Jest testing library** in order to write with the **TDD approach**.

## Local commands

Since I already deployed the Django backend service this Node.js app is based on, I did not deploy it. But you can clone this repository in order to try it locally.

Here are the two main commands that you may need (I use yarn, but you can use npm):

* To start the app:

```
yarn start
```

* To run the tests:
```
yarn test
```


## Endpoints

### User

* Register (/user/register)
  
  `POST`: Takes a `username (string)` and a `password (string)`. Returns an error if the request failed, or an `AuthenticationToken` if the request was successful.

* Login (/user/login)
  
  `POST`: Takes a `username (string)` and a `password (string)`. Returns an error if the request failed, or an `AuthenticationToken` if the request was successful.

> Note: the `AuthenticationToken` needs to be set as a header in order to be authenticated for all the other requests.

### List

* General (/list)
  
  `GET`: Returns an array of all the lists created by the authenticated user.

  `POST`: Takes a `title (string)` and a `color (string, optional)`. Creates a list instance and links it to the authenticated user. Returns the object details in a json format.

* Detail (/list/:id)

  `GET`: Returns the details of the list if it was created by the authenticated user.

  `PATCH`: Takes a `title (string, optional)` and a `color (string, optional)`. Updates the instance if it was created by the authenticated user.

  `DELETE`: Deletes the instance if it was created by the authenticated user.

### Sublist

* General (/sublist)
  
  `GET`: Returns an array of all the sublists created by the authenticated user.

  `POST`: Takes a `title (string)` and a `ListId (number)`. Creates a sublist instance and links it to the authenticated user and the list corresponding to the given `ListId`. Returns the object details in a json format.

* Detail (/sublist/:id)

  `GET`: Returns the details of the sublist if it was created by the authenticated user.

  `PATCH`: Takes a `title (string)`. Updates the instance if it was created by the authenticated user.

  `DELETE`: Deletes the instance if it was created by the authenticated user.

### Task

* General (/task)
  
  `GET`: Returns an array of all the tasks created by the authenticated user.

  `POST`: Takes a `title (string)` and a `SublistId (number)`. Creates a task instance and links it to the authenticated user and the sublist corresponding to the given `SublistId`. Returns the object details in a json format.

* Detail (/task/:id)

  `GET`: Returns the details of the task if it was created by the authenticated user.

  `PATCH`: Takes a `title (string)`. Updates the instance if it was created by the authenticated user.

  `DELETE`: Deletes the instance if it was created by the authenticated user.

* Complete (/task/:id/complete)

  `POST`: Takes no argument. Runs the custom `complete` method of the instance if it was created by the authenticated user.

* Uncomplete (/task/:id/uncomplete)

  `POST`: Takes no argument. Runs the custom `uncomplete` method of the instance if it was created by the authenticated user.

### Subtask

* General (/subtask)
  
  `GET`: Returns an array of all the subtasks created by the authenticated user.

  `POST`: Takes a `title (string)` and a `TaskId (number)`. Creates a subtask instance and links it to the authenticated user and the task corresponding to the given `TaskId`. Returns the object details in a json format.

* Detail (/subtask/:id)

  `GET`: Returns the details of the subtask if it was created by the authenticated user.

  `PATCH`: Takes a `title (string)`. Updates the instance if it was created by the authenticated user.

  `DELETE`: Deletes the instance if it was created by the authenticated user.

* Complete (/subtask/:id/complete)

  `POST`: Takes no argument. Runs the custom `complete` method of the instance if it was created by the authenticated user.

* Uncomplete (/subtask/:id/uncomplete)

  `POST`: Takes no argument. Runs the custom `uncomplete` method of the instance if it was created by the authenticated user.
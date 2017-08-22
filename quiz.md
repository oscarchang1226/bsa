# Inline Quiz App

## Init
 - currentQuestion 0
 - setupReady: false
 - containerRef: null
 - contentRef: null
 - headerRef: null
 - QuizData: null
 - headingLevel: null
 - AttemptData: []
 - numericalQuizID: 0
 - currentQuestionID: 0
 - onComplete: null
 - onReady: null
 - tabIndexSet: 1
 - smallWidthTolerance: 650
 - isHint: false
 - inputText: []
 - savedText: []
 - textInternal: null
 - inputScores: []
 - headerAnimated: false

## Methods

### setupQuiz(file, location)
1. increment numerical quiz id
2. set file to global variable
3. query element by id with given location
 - set queried element to container ref
 - execute getQuizData with BuildQuiz

### getQuizData(callback)
1. get json file
2. set data from json to QuizData
3. execute callback with QuizData

### HasClass(DomObj, classID)
1. check if DomObj contains classID
2. return a boolean whether classID is found.

### shuffle(array)
1. iterate array
2. in each iteration randomly shuffle with the current item

### BuildQuiz()
1. define container with DefineContainer
2. set id to all questions
3. set empty array to questions chosen answers
4. use inputScores to initialize each question's scores default is 0
5. use savedText to initialize each questions's text? default is 0
6. randomize questions if is randomize
7. set preQuizText to 'none' when nothing is provided
8. set preQuizMedia to 'none' when nothing is provided
9. set postQuizText to 'none' when nothing is provided
10. set postQuizMedia to 'none' when nothing is provided
11. always set repeat on complete to true.
12. set headinglevel to 1 if nothing is provided. (max 3)


### DefineContainer()
1. create section element for container
2. set id to ILQ_container
3. set role to InlineQuizApplication
4. create section element for header with ILQ_header id. If !...QuizData.General.hideTitle and set it to headerRef
5. create section element for content  with ILQ_content id and set it to contentRef
6. container append content
7. InlineQuizApp container append container

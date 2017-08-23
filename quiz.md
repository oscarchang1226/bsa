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
13. build button if pre media exist otherwise go next question
14. Execute onReady if app onReady on quiz data if onReady is not null

### RequestNextQuestion()
1. stop text interval
2. assess feedback (continuous, report, none)
3. go next question

### AssessFeedback()
1. save text input
2. get question score by getQuestionScore
3. build feedback
4. force correct 
5. show feedback if set to continuous
6. Note: evalueate question here


### saveTextInput()
1. save text input to inputText
2. replace savedText item at current question with input text

### getQuestionScore(questionIndex)
1. check answers including alternate answers
2. keep track of scores
3. add score to inputScores
4. if score minimum value is 0
5. return current score

### DefineContainer()
1. create section element for container
2. set id to ILQ_container
3. set role to InlineQuizApplication
4. create section element for header with ILQ_header id. If !...QuizData.General.hideTitle and set it to headerRef
5. create section element for content  with ILQ_content id and set it to contentRef
6. container append content
7. InlineQuizApp container append container

### SetTextSlide(data, onOK, options)
1. tab index set to 1
2. set button label
3. create div element for ILQ_Description with class ILQ_Description $@
4. add hint(data) to description if there is one
5. add media if there is one 
6. create div element with id ILQ_buttonSet
7. append description and button set to content reference
8. add onOK callback to button if any is provided
8. scroll to top


### MakeFullBaseButton(onOK, label, options)
1. create button with given argument
2. add onkeypress event listener(13, 32) and call onOK

### goNextQuestion()
1. check if current question index is over question length
2. setQuestionSlide with current question

### setQuestionSlide(data, options)
1. set class to container with question type code
2. set feedback type
3. set button label depending on feedback type
4. set question header
5. set question container
6. replace BLANK in question with blank input field (BLANK for Fill in the blanks and Math)
7. add hint button if showHint is set
8. allow back button if is allow previous
9. next button all the way if  allow none

### HandleAnswerSelection(event)
1. repop event recreate buttons
2. check if answer selected
3. show button if so
4. allowNone option will not show next button

### HandleTextInput()
1. increment blank count
2. ensure keypress is number then stop keypress

### ShowHint()
1. set text slide with hint

## RepopulateQuestion()
1. repopulate question with saved text and all


## Sequence
1. setupQuiz
2. getQuizData
3. buildQuiz


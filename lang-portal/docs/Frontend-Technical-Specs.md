# FrontEnd Technical Specs
We would like to build a Italian language learning web app.

## Role/Profession
**Frontend Developer**

## Project Description

### Project Brief
We are building a Italian language learning web-app which serves the following purposes:
- A portal to launch study activities
- To store, group and explore Italian vocabulary
- To review study progress

The web-app is intended for desktop only, so we don't have to be concerned with mobile layouts.

## Technical Requirements
- React.js as the frontend library
- Tailwind CSS as the CSS framework
- Vite.js as the local development server
- Typescript for the programming language
- ShadCN for components

## Frontend Routes
This is a list of routes for our web-app we are building. Each of these routes is a page and we'll describe them in more detail under the pages heading.

# Routes

## Main Routes
- **Dashboard**: `/dashboard`

## Study Activities
- **Index**: `/study_activities`
- **Show**: `/study_activities/:id`
- **Launch**: `/study_activities/:id/launch`

## Words
- **Index**: `/words`
- **Show**: `/words/:id`

## Word Groups
- **Index**: `/groups`
- **Show**: `/groups/:id`

## Study Sessions
- **Index**: `/study_sessions`
- **Show**: `/study_sessions/:id`

## Settings
- **Settings Page**: `/settings`

The default route `/` should forward to `/dashboard`.

## Global Components

### Navigation

There will be a horizontal navigation bar with the following links:  
- Dashboard  
- Study Activities  
- Words  
- Word Groups  
- Study Sessions  
- Settings  

### Breadcrumbs

Beneath the navigation there will be breadcrumbs so users can easily see where they are. Examples of breadcrumbs:

- Dashboard  
- Study Activities > Adventure MUD  
- Study Activities > Typing Tutor  
- Words > Parole  
- Word Groups > Core Verbs  

## Pages  

### Dashboard  
### Route
The route for this page [/dashboard](/dashboard) 

### Purpose
This page provides a summary of the student's progression and serve as the default page when a user visits the web app. 

### Components

#### Last Study Session  
- Displays the last activity used and the time it was last accessed.  
- Summarises correct vs incorrect responses from the last activity.  
- Includes a link to the relevant study group.  

#### Study Progress  
- Shows the total words studied (e.g., `3/124`) across all study sessions.  
- Displays the total words studied out of all possible words in the database.  
- Indicates mastery progress (e.g., `0%`).  

#### Quick Stats  
- **Success rate:** e.g., `80%`  
- **Total study sessions:** e.g., `4`  
- **Total active groups:** e.g., `3`  
- **Study streak:** e.g., `4 days`  

#### Start Studying Button  
- Redirects to the study activities index page.  

### Needed API Endpoints
GET /api/dashboard/last_study_session
GET /api/dashboard/study_progress
GET /api/dashboard/quick_stats

## Study Activities Index
### Route
The route for this page [/study-activities](/study-activities)  

### Purpose
This is a grid of cards which represent an activity.  

### Components
Study Activity Card
Each study activity card has:  
- Thumbnail of the study activity
- Title of the study activity 
- "Launch" button  
- "View" button 

The "Launch" button will open a new address in a new tab.  
Study activities are their own apps, but in order for them to launch they need to be provided a `group_id`.  

Example: localhost:8081?group_id=4

This page requires no pagination because there is unlikely to be more than 20 possible study activities.  

The "View" button will go to the **Student Activities Show Page**.  

### Needed API Endpoints
GET /api/study_activities

## Study Activities Show  
### Route
The route for this page [/study-activities/:id](/study-activities/:id)  

### Purpose
The purpose of this page is to show the details of a study activity and its past study sessions.

### Components
This page will have an information section which will contain:  
- Thumbnail of study activity
- Title of study activity
- Description of study activity
- Launch button  
- Study Activities Paginated List, which will contain a list of sessions for this study activity. A session item will contain  
    - **id**
    - **Activity Name**: The name of the study activity  
    - This will be a link to the Study Session Show Page.
    - **Group Name**: So you know what group name was used for the sessions  
    - This will be a link to the Group Show Page  
    - **Start Time**: When the session was created in `YYYY-MM-DD HH:MM` format (12-hour)  
    - **End Time**: When the last `word_review_item` was created  
    - **# Review Items**: The number of review items  

### Needed API Endpoints
GET /api/study_activities/:id
GET /api/study_activities/:id/study_sessions

## Study Activities Launch 
### Route
The route for this page [/study-activities/:id/launch](/study-activities/:id/launch)  

### Purpose
The purpose of this page is to launch a study activity.

### Components
- Name of study activity
- Launch form
    - select field for group
    - launch now button

### Behaviour
After the form is submitted a new tab opens with the study activity based on its URL provided in the database.

Also the after form is submitted the page will redirect to the study sesssion show page

### Needed API Endpoints
POST /api/study_activities/:id/launch

## Words Index  
### Route
The route for this page [/words](/words)  

### Purpose
The purpose of this page is to show all words in our database.

### Components

Paginated Word List
This is a table of words with the following cells:  
- **Italian**: The Italian word
  - This will also contain a small button to play the sound of the word  
  - The Italian word will be a link to the Words Show page  
- **English**: The English version of the word  
- **# Correct**: Number of correct word review items  
- **# Wrong**: Number of wrong word review items  

There should only be **50 words** displayed at a time.  

### Pagination  
- **Previous button**: Greyed out if you cannot go further back  
- **Page 1 of 3**: With the current page bolded  
- **Next button**: Greyed out if you cannot go any further forward  

### Sorting  
All table headings should be **sortable**. Clicking a heading will toggle between **ASC** (ascending) and **DESC** (descending) order.  

An ASCII arrow should indicate the sorting direction:  
- **ASC (ascending)**: Arrow pointing down `↓`  
- **DESC (descending)**: Arrow pointing up `↑`  

### Needed API Endpoints
GET /api/words

## Words Show  
### Route
The route for this page [/words/:id](/words/:id)  

### Purpose
The purpose of this page is to show information about a specific word.

### Components
- Italian
- English
- Study Statistics
    - Correct Count
    - Wrong Count
- Word Groups
    - show an a series of pills eg. tags
    - when group name is clicked it will take us to the group show page

### Needed API Endpoints
GET /API/words/:id

## Word Groups Index  
### Route
The route for this page [/word-groups](/word-groups)  

### Purpose
The purpose of this page is to show a list of groups in our database.

### Components

Paginated Group List
This is a table of word groups with the following cells:  
- **Group Name**: The name of the group  
  - This will be a link to **Word Groups Show**  
- **# Words**: The number of words associated with this group  

This page contains the same **sorting** and **pagination** logic as the **Words Index** page. 

Clicking the group name will take us to the group show page

### Needed API Endpoints
GET /api/groups

## Word Groups Show  
### Route
The route for this page [/words-groups/:id](/words-groups/:id)  

### Purpose
The purpose of this page is to show information about a specific group.

### Components
This has the same components as **Words Index** but is scoped to only show words that are associated with this group.  

- Group Name
- Group Statistics
- Total Word Count
- Words in Group (Paginateds List of Words)
- Should use the same component as the words index page
- Study Sessions (Paginated List of Study Sessions)
- Should use the same component as the study sessions index page

### Needed API Endpoints
GET /api/groups/:id (the name and groups stats)
GET /api/groups/:id/words
GET /api/groups/:id/study_sessions

## Sessions Index  
### Route
The route for this page [/sessions](/sessions)  

### Purpose
This page contains a list of **sessions**, similar to **Study Activities Show**.  

### Components
This page contains the same **sorting** and **pagination** logic as the **Words Index** page.  

Paginated Study Session List
    - Columns
    - Id
    - Activity Name
    - Group Name
    - Start Time
    - End Time
    - Number of Review Items

Clicking the study session id will take us to the study session show page

### Needed API Endpoints
GET /api/study_sessions

## Study Session Show 
### Route
/study_sessions/:id

### Purpose
The purpose of this page is to show information about a specific study session.

### Components
- Study Sesssion Details
    - Activity Name
    - Group Name
    - Start Time
    - End Time
    - Number of Review Items
- Words Review Items (Paginated List of Words)
    - Should use the same component as the words index page

### Needed API Endpoints
GET /api/study_sessions/:id
GET /api/study_sessions/:id/words

## Settings Page  
### Route
The route for this page [/settings](/settings)  

### Purpose
The purpose of this page is to make configurations to the study portal.

### Components
**Dark Mode Toggle**:  
This is a toggle that changes from light to dark theme. 

**Reset History Button**:  
This has a button that allows us to reset the entire database.  
We need to confirm this action in a dialog and type the word "reset me" to confirm.  

**Full Reset Button**:
this will drop all tables and re-create with seed data

### Needed API Endpoints
POST /api/reset_history
POST /api/full_reset
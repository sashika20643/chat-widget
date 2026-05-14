1. Design Principles

Desktop: Side panel must be 25% of screen width H100-Chatbot-UI-Coding Briefing

Mobile: Full-width conversational flow with header & drawer H100-Chatbot-UI-Coding Briefing

5-column calendar grid H100-Chatbot-UI-Coding Briefing

Crossed-out days/times are non-bookable H100-Chatbot-UI-Coding Briefing

Next month row in calendar = 25% opacity H100-Chatbot-UI-Coding Briefing

Helvetica Neue Medium across system H100-Chatbot-UI-Coding Briefing

2. Color System

2.1 Brand Colors

Primary

#439143

Used for:

Primary CTA

Selected states (calendar, timeslot)

Active states

Focus borders

Primary Light

#a5d6a5

Used for:

Success background

Confirmed state button

Accent

#ef791e

Used for:

Highlight CTA

Important interactions

Hover emphasis

Accent Light

#ffb888

Used for:

Informational background

Hover surfaces

2.2 Neutrals

Token

Value

Usage

White

#ffffff

Background

Black

#000000

Borders (desktop), dark icons

Dark

#1d1d1b

Border primary

Text Primary

#222222

Main text

Text Muted

#b3b3b3

Placeholder

Disabled Opacity

25%

Disabled elements

H100-Chatbot-UI-Coding Briefing…

3. Typography System

Font: Helvetica Neue
Weight: Medium (500) H100-Chatbot-UI-Coding Briefing…

Role

Size

Line Height

Usage

H1

24pt

29.1pt

Desktop heading

H2

20pt

24.2pt

Section titles

Body Large

17pt

21.6pt

Chat messages

Body

16pt

20pt

Form text

Button

17pt

20.4pt

All buttons

Small

15pt

18pt

Sub labels

Micro

11pt

29.2pt

Metadata

4. Layout System

Desktop

Structure:

--------------------------------------
| Side Panel (25%) | Chat (75%) |
--------------------------------------


Side panel width: 25% H100-Chatbot-UI-Coding Briefing…

Chat width: 75%

Form max width: 350px

Calendar max width: 370px

Messages max width: 350px

Mobile

Full width layout H100-Chatbot-UI-Coding Briefing…

Top header with:

Logo

Hamburger

Action icons

Chat stacked vertically

Calendar and forms appear inline in chat flow

5. Component System

5.1 Button System

Base Properties

Height: 44px minimum

Padding: 14px 20px

Radius: 29px

Font: 17pt

Weight: 500

Border: 0.85pt dark (unless accent)

Button Variants

1. Primary Button

Background: #439143

Text: White

Border: 0.85pt Dark

Hover: 85% opacity

Disabled: 25% opacity

Use cases:

Add to Calendar H100-Chatbot-UI-Coding Briefing…

Book Appointment

2. Secondary Button

Background: White

Text: #222

Border: 0.85pt Dark

Hover: Accent Light background

Disabled: 25%

Use cases:

Secondary actions

Cancel

3. Accent Button

Background: #ef791e

Text: White

Border: None

Hover: 85% opacity

Disabled: 25%

Use cases:

Highlighted CTA

4. Success / Confirmation Button

Background: #a5d6a5

Text: Black

Border: None

Used after booking

5.2 Chat Bubble

User Bubble

Background: Primary

Text: White

Radius: 25px

Padding: 20px

Max width: 350px

Bot Bubble

Background: White

Border: 0.85pt Dark

Text: #222

Radius: 25px

5.3 Input Fields

Height: 46px H100-Chatbot-UI-Coding Briefing…

Border: 0.85pt Dark

Radius: 20px

Padding: 14px

Placeholder: #b3b3b3

Focus border: Primary

Form fields:

Name

Email

Phone

Message H100-Chatbot-UI-Coding Briefing…

5.4 Calendar Component

Grid

5 columns H100-Chatbot-UI-Coding Briefing…

Day size: 37px x 37px

Radius: 31px

Gap: 7–9px

States

State

Style

Default

White + border

Selected

Primary background + white text

Disabled

25% opacity

Crossed Out

line-through + 25%

Next Month Row

25% opacity

H100-Chatbot-UI-Coding Briefing…

Special Rule:

Month can start at 03 if Sun/Mon closed H100-Chatbot-UI-Coding Briefing…

5.5 Time Slot Component

Size: 37px height

Radius: 31px

Border: 0.85pt dark

Font: 14–17pt

States:

Default

Selected (Primary)

Disabled (25% opacity)

Crossed-out (line-through) H100-Chatbot-UI-Coding Briefing…

Sales team must be able to set blockers H100-Chatbot-UI-Coding Briefing…

5.6 Side Panel (Desktop)

Width: 25% H100-Chatbot-UI-Coding Briefing…

Background: White

Vertical spacing between menu items: 23px

Heading: 24pt

5.7 Header (Mobile)

Height approx. 55–69px

Left: Logo

Right:

Info icon

Favorite

Menu (hamburger) H100-Chatbot-UI-Coding Briefing…

5.8 Confirmation Card

After booking:

Rounded container

White background

Border: 0.85pt Dark

Message:

Appointment date/time

Email confirmation note H100-Chatbot-UI-Coding Briefing…

Primary button: Add to Calendar

6. State System

State

Rule

Hover

85% opacity

Focus

Primary border

Disabled

25% opacity

Active

Primary background

Selected

Primary background

7. Responsive Behavior

Breakpoint

Behavior

Mobile

Full width chat

Tablet

Single column but larger spacing

Desktop

25% / 75% split

Large Desktop

Max chat width 1200px center aligned

8. Accessibility

Contrast > 4.5:1

Disabled always visible via opacity 25%

Click targets ≥ 44px height

Keyboard focus ring must be visible

9. Semantic Role Mapping

Role

Component

Primary Action

Button.Primary

Secondary Action

Button.Secondary

Confirm Action

Button.Success

Highlight

Button.Accent

User Chat

ChatBubble.User

Bot Chat

ChatBubble.Bot

Booking Selection

Calendar.Day.Selected

Blocked

Calendar.Day.Disabled

10. Component Variations Summary

Buttons:

Primary

Secondary

Accent

Success

Disabled

Icon Button (circle 37px)

Calendar:

Normal

Selected

Next Month (25%)

Blocked

Closed Day

Timeslot:

Normal

Selected

Disabled

Blocked

Inputs:

Default

Focus

Error (future extension)

Disabled
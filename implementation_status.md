# Implementation Status

## Review of Flow Requirements vs. Current Implementation

### Student Flow
1. **Student clicks on enroll now and it pops up the register now if the student is not yet registered.**
   - **Status**: Implemented. Supported through `EnrollPage.tsx`.

2. **He registers and after successful registration, he is redirected to the payment page. And he completes the payment.**
   - **Status**: Implemented. Handled through `CheckoutButton` and Paystack hook in `EnrollPage`.

3. **Payment - either full, or he should be able to select out of our installment options. e.g 3times, 4times, 5times.**
   - **Status**: Partially Implemented. Currently, it's hardcoded to a 12-month installment. Needs an update to allow flexible choices (e.g. 3, 4, 5 months). Frontend allows "installment" but no dynamic month selection.

4. **They should be able to see past classes in dashboard.**
   - **Status**: Implemented. Done in `StudentDashboardPage` redirecting to `CourseDetailPage`.

5. **The recorded class will be uploaded to their dashboard and the notification will be sent to their email.**
   - **Status**: Implemented. Features handled by `addRecording` in `academyController.ts`.

6. **Student who paid through installment should be able to see the next installment due date and be able to pay it on or before the due date.**
   - **Status**: Partially Implemented. Dashboard shows the `nextPaymentDue` and shows a modal when portal is locked due to overdue payments. However, there is no explicit button to just "pay next installment" *before* it gets locked, or logic for actually fulfilling the installment inside the dashboard.

7. **If he pays before the due date, the next installment due date should be updated.**
   - **Status**: Pending. There is no route for paying an installment payment after the first time. Need to add a Paystack hook/route for paying next installments on the student dashboard.

8. **Class link will show in their dashboard and will be sent to their email.**
   - **Status**: Implemented. Handled by recordings.

9. **If a student doesnt pay, he should not be able to do anything on the dashboard apart from payment and a notification should be sent to the student. The payment should be highlighted on the dashboard. And a modal should pop up on the dashboard with a button to pay.**
   - **Status**: Implemented visually via `portalLocked` block on the `StudentDashboardPage` although the actual payment action inside the modal doesn't trigger Paystack correctly.

10. **Few days before the due date, a notification should be sent to the student. And on the dashboard, a pop up should come up to remind the student of the due date.**
    - **Status**: Pending. Needs a background job or logic to send email reminders and a UI popup to remind.

11. **Have a field on the dashboard for students to lodge complains. Its called message support or log a complain.**
    - **Status**: Pending. A `complaints` system needs to be built (Backend: Table `complaints`, routes. Frontend: Form in Dashboard).

### Tutor Flow
12. **Tutor should see lists of students assigned to him.**
    - **Status**: Pending. Currently see course list and total count without details or assigning features.

13. **He will see the link to the recorded class.**
    - **Status**: Implemented on the course detail page.

14. **He can grade each student's assignment.**
    - **Status**: Pending. Table `submissions` exists, but there is no UI/API for tutors to view submissions and submit a grade/feedback.

15. **He can lodge a complain or add a remark about a student on each student list.**
    - **Status**: Pending. Backend table `remarks` missing, no UI.

16. **He can upload the recorded class to the students dashboard.**
    - **Status**: Implemented in `TutorDashboardPage`.

### Admin Flow
17. **Admin assigns students to tutor.**
    - **Status**: Pending. No `tutor_student_assignments` table or equivalent UI.

18. **A list of students is shown to the admin and he assigns them to a tutor.**
    - **Status**: Pending. Admin UI needs a list and assignment selector.

19. **Admin can see all students and their progress, and can see assigned tutor on them. With filters to filter by course, tutor, payment status, etc.**
    - **Status**: Pending.

20. **Admin can see all tutors and their students. Admin can filter tutors by course, etc.**
    - **Status**: Pending.

21. **Admin can see all payments and their status.**
    - **Status**: Pending. We might have some payment logs but need Academy specific admin views.

22. **Admin can see all assignments and their status.**
    - **Status**: Pending.

23. **Admin can see all recorded classes and their status.**
    - **Status**: Pending.

24. **Admin can see all complains and their status.**
    - **Status**: Pending.

25. **Admin can see all remarks and their status.**
    - **Status**: Pending.

## Next Execution Plan:
We will take an iterative approach:
1. Ensure the underlying database schema holds all the new required entities (`tutor_students_assignments` or similar for assigning students directly to tutors, `complaints`, `remarks`, update `payment_plan` and `installments` logging).
2. Implement backend routes and controllers.
3. Update frontend components step by step.

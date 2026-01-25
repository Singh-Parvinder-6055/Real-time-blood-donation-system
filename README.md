# Real-time-blood-donation-system
How to get run the code in your computer?
run the following commands:

1. git pull origin main
2. npm install --legacy-peer-deps

Now You need to make a file named   ".env" in the main directory of the project.

NOTE: If you don't have an account on cloudinay, create one first.

Fill the  details of your cloudinary account in .env  as follows:

1. CLOUD_NAME=
2. CLOUD_API_KEY=
3. CLOUD_API_SECRET=


How it works?

1. Patients
Patients need to go to hospital or any organization where they will tell their blood group  username on Blood-Connect to the organization. Then, the organization will request an emergency blood request for the patient. If an emergency blood request has been raised for a patient, they can see it on their portal.

2. Organization
Organizations can generate emergency blood requests for patients and organize blood Donation camps. They can see the emergency requests raised by them and camps organized by them on their dashboard along with donors and their phone numbers who fulfilled emergency requirements and registered for donation camps. But they need to get verified first by uploading required documents. The admin will review their verification request and may approve or deny. Their verification status will be visible on their dashboard.

Once the blood has been collected, emergency requests cannot be deleted. Likewise, once the blood donation camp has been completed, they cannot be deleted. However, blood donation camps can be edited before their start date but their location cannot be changed.

3. Admin 
Admin can review and approve or reject verification requests or organiations.
Admin can also generate emergency blood requests and organize camps
Admin can also see active emergency requests at different locations.

NOTE:- Admin and organizations can neither fulfilled emergency requirements nor participate in camps.
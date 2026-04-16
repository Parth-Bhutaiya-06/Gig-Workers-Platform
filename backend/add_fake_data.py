import os
import sys
import random
from datetime import timedelta, date

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gig_backend.settings')

import django
django.setup()

from core.models import User, Job, Application

print("Generating fake jobs and applications...")

posters = list(User.objects.filter(role='poster'))
workers = list(User.objects.filter(role='worker'))

if not posters or not workers:
    print("Not enough users to create fake data. Please ensure there are some workers and posters.")
    sys.exit(1)

categories = ['Creative Design', 'General Work', 'Delivery', 'Technology', 'Event Staff']
titles_by_cat = {
    'Creative Design': ['Need a logo design', 'Website redesign', 'Flyer design for event', 'Create social media posts'],
    'General Work': ['Help moving furniture', 'Lawn mowing', 'Painting the fence', 'Cleaning the garage'],
    'Delivery': ['Deliver packages downtown', 'Grocery pickup', 'Courier documents', 'Transporting small items'],
    'Technology': ['Fix my wordpress site', 'Setup home network', 'PC repairs', 'Data entry work'],
    'Event Staff': ['Bartender for a party', 'Event usher', 'Catering assistant', 'DJ needed']
}

jobs = []
for i in range(30):
    poster = random.choice(posters)
    category = random.choice(categories)
    title = random.choice(titles_by_cat[category])
    start_date = date.today() + timedelta(days=random.randint(1, 14))
    
    job = Job.objects.create(
        poster=poster,
        title=title,
        category=category,
        location=f"Pinned: 23.{random.randint(1000,9999)}, 72.{random.randint(1000,9999)}",
        description=f"This is a generated fake job description for {title}. Need someone reliable. Please apply!",
        wages=random.randint(500, 2500),
        start_date=start_date,
        due_date=start_date + timedelta(days=random.randint(1, 5)),
        urgency=random.choice(['regular', 'urgent']),
        is_digital=random.choice([True, False]),
        status=random.choice(['open', 'open', 'approved']) 
    )
    jobs.append(job)

print(f"Created {len(jobs)} fake jobs.")

apps = []
for job in jobs:
    # Most jobs have 0 to 3 applications
    num_apps = random.randint(0, 3)
    job_workers = random.sample(workers, k=min(num_apps, len(workers)))
    
    for worker in job_workers:
        status = 'pending'
        if job.status == 'approved':
            # At least one must be approved
            status = random.choice(['rejected', 'pending'])
            
        app, created = Application.objects.get_or_create(
            job=job,
            worker=worker,
            defaults={
                'status': status,
                'negotiated_wage': job.wages if random.choice([True, False]) else None
            }
        )
        if created:
            apps.append(app)
            
    # If job is approved, ensure one worker got approved
    if job.status == 'approved' and job_workers:
        approved_app = Application.objects.filter(job=job).first()
        if approved_app:
            approved_app.status = 'approved'
            approved_app.save()

print(f"Created {len(apps)} fake applications.")
print("Fake data generation successful!")

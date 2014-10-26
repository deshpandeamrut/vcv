create table if not exists users (
id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
username varchar(256) not null,
email varchar(256) not null check (length(email) > 0),
title varchar(10) not null,
password varchar(256) not null,
first_name varchar(32) not null,
middle_name varchar(32),
last_name varchar(32),
dob date NULL DEFAULT NULL,
social_auth_password varchar(256) default null,
fb_auth_id varchar(30),
twitter_auth_id varchar(30),
gmail_auth_id varchar(30),
linked_in_auth_id varchar(30),
status varchar(16) not null default 'unverified' check (status in ('unverified', 'verified')),
user_type varchar(30) not null default 'employee' check (user_type in ('seeker', 'recruiter','admin')),
membership_type varchar(30) not null default 'free' check (membership_type in ('free', 'silver','gold')),
profile_status varchar(30) not null default 'personal' check (profile_status in ('personal', 'loan','financial')),
profile_rating varchar(30) not null default 0,
profile_completion_percentage int(11) not null default 0,
is_activated tinyint(1) default 0,
activated_at timestamp NULL DEFAULT NULL,
is_profile_complete tinyint(1) default 0,
remember_token varchar(100),
verified_at timestamp NULL DEFAULT NULL,
verified_by varchar(256)not null,
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
created_by varchar(256) not null,
updated_at timestamp not null DEFAULT '0000-00-00 00:00:00',
updated_by varchar(256)not null,
is_deleted tinyint(1) not null default 0,
CONSTRAINT users_unique_email_cons UNIQUE (email),
CONSTRAINT users_unique_username_cons UNIQUE (username)
) ENGINE=InnoDB;

create table if not exists addresses (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_uid int(11) not null,
  street_no varchar(30) not null,
  street_name varchar(256) not null check (length(street_name) > 0),
  area varchar(256) not null check (length(area) > 0),
  landmarks varchar(128),
  other text,
  postcode varchar(16) not null check(length(postcode) > 0),
  latitude numeric(10,2),
  longitude numeric(10,2),
  city_name varchar(128) not null,
  state_name varchar(128) not null,
  country_name varchar(128) not null default 'India',
  use_as_default integer not null default 1,
  status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
  address_type varchar(16) not null default 'user' check (address_type in ('company', 'user')),
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,  
  FOREIGN KEY(linkable_uid) REFERENCES users(id)
)ENGINE=InnoDB;

create table if not exists phones (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_uid int(11) not null, 
  phone_type varchar(16) not null default 'mobile' check( phone_type in ('mobile','work','home')),
  phone_country_code varchar(10) not null default '91' check(length(phone_country_code) > 0),
  phone_city_code varchar(10) not null,
  phone_number varchar(10) not null check (length(phone_number) > 0),
  use_as_default tinyint(1) not null default 1,
  status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
  FOREIGN KEY(linkable_uid) REFERENCES users(id),
  CONSTRAINT phones_unique_cons UNIQUE(linkable_uid, phone_country_code,phone_city_code,phone_number,status)
)ENGINE=InnoDB;

create table if not exists job_seeker_details (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_uid int(11) not null,
  resume_headline varchar(256) not null,
  job_category varchar(256) not null,
  skill_sets text not null,
  preferred_location varchar(256) not null,
  is_relocate tinyint(1) default 0,
  total_experience numeric(10,1) not null,
  comments text,
  status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
  FOREIGN KEY(linkable_uid) REFERENCES users(id)
)ENGINE=InnoDB;

create table if not exists job_seeker_employment_details (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_uid int(11) not null,
  employment_type varchar(30) not null default 'current' check (employment_type in ('current', 'prior')),
  employment_status varchar(30) not null default 'permanent' check (employment_status in ('permanent', 'part_time','contract')),
  yearly_salary numeric(10,2) not null check(length(yearly_salary) > 0),
  profession varchar(256) not null,
  industry varchar(256) not null,
  functional_area varchar(256) not null,
  employment_period varchar(30) not null,
  employment_role varchar(30) not null,
  status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
  FOREIGN KEY(linkable_uid) REFERENCES users(id)
)ENGINE=InnoDB;


create table if not exists job_seeker_education_details (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_uid int(11) not null,
  basis_of_education varchar(256),
  year_of_passing date,
  school_name varchar(256),
  passing_percentage numeric(10,2),
  status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
  FOREIGN KEY(linkable_uid) REFERENCES users(id)
)ENGINE=InnoDB;


create table if not exists job_seeker_project_details (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_uid int(11) not null,
  project_name varchar(30) not null,
  project_details text,
  project_link varchar(256) not null,
  status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
  FOREIGN KEY(linkable_uid) REFERENCES users(id)
)ENGINE=InnoDB;

create table if not exists images (
  id int(11) not null primary key AUTO_INCREMENT,
  image_type varchar(30) not null,
  image_name varchar(256) not null,
  linkable_cid int(11) not null,
  image_path varchar(128) not null,
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0
)ENGINE=InnoDB;

create table if not exists attachments (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_cid int(11) not null,
  attachment_type varchar(30) not null,
  attachment_info varchar(30) not null,
  attachment_usage varchar(30) not null,
  attachment_name varchar(256) not null,
  attachment_path varchar(128) not null,
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0
)ENGINE=InnoDB;


-- create table if not exists job_postings (
--   id int(11) not null primary key AUTO_INCREMENT,
--   linkable_uid int(11) not null,
--   job_type varchar(16) not null default 'permanent' check (status in ('permanent', 'contract')),
--   job_industry varchar(256) not null,
--   job_description text not null,
--   job_designation varchar(256) not null,
--   min_exp_level int(11) not null default 0,
--   max_exp_level int(11) not null default 0,
--   min_salary_range varchar(256) not null default 'Best in Industry',
--   max_salary_range varchar(256),
--   company_name varchar(256),
--   company_logo text,
--   link_to_compnay varchar(256),
--   company_description text,
--   job_requirement text not null,
--   status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
--   created_at timestamp not null default CURRENT_TIMESTAMP,
--   updated_at timestamp not null default '0000-00-00 00:00:00',
--   created_by varchar(128),
--   updated_by varchar(128),
--   is_deleted tinyint(1) not null default 0,
--   FOREIGN KEY(linkable_uid) REFERENCES users(id)
-- )ENGINE=InnoDB;


create table if not exists job_posting_details (
  id int(11) not null primary key AUTO_INCREMENT,
  linkable_uid int(11) not null,
  job_designation varchar(512) not null,
  job_description text not null,
  no_of_vacancies int(11) not null,
  keywords text not null,
  min_exp_level int(11) not null default 0,
  max_exp_level int(11) not null default 0,
  min_salary_range varchar(256) not null default 'Best in Industry',
  max_salary_range varchar(256),
  is_salary_hidden tinyint(1),
  job_locations varchar(256) not null,
  job_industry varchar(256) not null,
  functional_area varchar(256) not null,
  job_type varchar(16) not null default 'permanent' check (status in ('permanent', 'contract')),
  job_time varchar(256) not null default 'fulltime' check (status in ('fulltime', 'parttime')),
  desired_candidate_qualifications text,
  desired_candidate_institution text,
  company_name varchar(256),
  company_description text,
  company_logo text,
  link_to_compnay varchar(256),
  company_contact_person varchar(256),
  company_address_id int(11),
  refresh_schedule varchar(256),
  status varchar(16) not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
  FOREIGN KEY(linkable_uid) REFERENCES users(id)
)ENGINE=InnoDB;

create table job_types (
  id int(11) not null primary key AUTO_INCREMENT,
  type varchar(512) not null,
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
)ENGINE=InnoDB;


create table job_functional_area (
  id int(11) not null primary key AUTO_INCREMENT,
  type varchar(512) not null,
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
)ENGINE=InnoDB;

create table degree_qualifications (
  id int(11) not null primary key AUTO_INCREMENT,
  name varchar(512) not null,
  created_at timestamp not null default CURRENT_TIMESTAMP,
  updated_at timestamp not null default '0000-00-00 00:00:00',
  created_by varchar(128),
  updated_by varchar(128),
  is_deleted tinyint(1) not null default 0,
)ENGINE=InnoDB;

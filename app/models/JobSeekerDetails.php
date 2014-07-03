<?php

class JobSeekerDetails extends Eloquent{

	protected $table = 'job_seeker_details';

	public function addseekerDetails($data){
		
		$id = DB::table('job_seeker_details')->insertGetId(array(
						'linkable_uid' => $data['user_id'],
						'resume_headline' => $data['resume_headline'],
						'job_category' => $data['job_category'],
						'skill_sets' => $data['skill_sets'],
						'preferred_location' => $data['preferred_location'],
						'is_relocate' =>$data['is_relocate'],
						'comments' =>$data['comments'],
						'total_experience' =>$data['total_experience'],
						'updated_at'=>date('Y-m-d H:i:s'),
						'created_by'=>$data['email_id'],
						'updated_by'=>$data['email_id']
				  	));
		return $id;
	} // end of function seekerDetails

	public function getJobSeekerDetailsByUserId($userId){
		$result = DB::table('job_seeker_details')
					->where('linkable_uid', $userId)
					->where('status', 'active')
					->get();

		return json_decode(json_encode($result),true);
	}
	
} // end of class
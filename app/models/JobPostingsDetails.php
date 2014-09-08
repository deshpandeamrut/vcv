<?php

class JobPostingsDetails extends Eloquent{

	protected $table = 'job_posting_details';
	
	public function addjobDetails($data){
		$salaryHiddenFlag = 0;
		$rescheduleFlag = 0;
		if(array_key_exists('refresh_schedule',$data));
			$rescheduleFlag = (empty($data['refresh_schedule'])? 0:1);
		if(array_key_exists('is_salary_hidden',$data));
			$salaryHiddenFlag = (empty($data['is_salary_hidden'])? 0:1);

					$id = DB::table('job_posting_details')->insertGetId(array(
								'linkable_uid' => $data['linkable_uid'],
								'job_designation' => $data['job_designation'],
								'no_of_vacancies' => intval($data['no_of_vacancies']),
								'job_description' => $data['job_description'],
								'keywords' => $data['keywords'],
								'min_exp_level' => $data['min_exp_level'],
								'max_exp_level' => $data['max_exp_level'],
								'min_salary_range' => $data['min_salary_range'],
								'max_salary_range' => $data['max_salary_range'],
								'is_salary_hidden' => $salaryHiddenFlag,
								'job_locations' => $data['job_locations'],
								'job_industry' => $data['job_industry'],
								'functional_area' => $data['functional_area'],
								'job_type' => $data['job_type'],
								'desired_candidate_qualifications' => $data['desired_candidate_qualifications'],
								'desired_candidate_institution' => $data['desired_candidate_institution'],
								'company_name' => $data['company_name'],
								'company_description' => $data['company_description'],
								'company_logo' => $data['company_logo'],
								'link_to_compnay' => $data['link_to_compnay'],
								'company_contact_person' => $data['company_contact_person'],
								'company_address_id' => $data['company_address_id'],
								'refresh_schedule' => $rescheduleFlag,
								'updated_at'=>date('Y-m-d H:i:s'),
								'created_by'=>$data['email_id'],
								'updated_by'=>$data['email_id']
							));
		return $id;
	}

	public function getProjectDetailsByUserId($userId){
		$result = DB::table('job_posting_details')
					->where('linkable_uid', $userId)
					->where('status', 'active')
					->get();
		return json_decode(json_encode($result),true);
	}
	
} // end of class
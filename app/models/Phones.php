<?php

class Phones extends Eloquent{

	protected $table = 'phones';

	public function addPhone($data){
			$result = $this->checkUniqCons($data['user_id'],'91',$data['phone_city_code'],$data['phone_number']);
			if(empty($result)){
				$id = DB::table('phones')->insertGetId(array(
							'linkable_uid' => $data['user_id'],
							'phone_type' => $data['phone_type'],
							'phone_country_code' => '91',
							'phone_city_code' => $data['phone_city_code'],
							'phone_number'=> $data['phone_number'],
							'updated_at'=>date('Y-m-d H:i:s'),
							'created_by'=>$data['email_id'],
							'updated_by'=>$data['email_id']
			  			));
			}else{
				// $id = DB::table('phones')
				// 		->where('linkable_uid', $data['user_id'])
				// 		->where('phone_country_code', $data['phone_country_code'])
				// 		->where('phone_city_code', $data['phone_city_code'])
				// 		->where('phone_number', $data['phone_number'])
				// 		->update(array(
				// 				'phone_type' => $data['phone_type'],
				// 				'phone_usage_type' => $data['phone_usage_type'],
				// 				'phone_country_code' => $data['phone_country_code'],
				// 				'phone_city_code' => $data['phone_city_code'],
				// 				'phone_number'=> $data['phone_number'],
				// 				'updated_at'=>date('Y-m-d H:i:s'),
				// 				'created_by'=>$data['email_id'],
				// 				'updated_by'=>$data['email_id']
				//   			));
				$id = 1;
				return $id;
			}
			return $id;
	}

	public function getContactDetailsByUserId($userId){
		$result = DB::table('phones')
					->select(
						'phone_type', 
						'phone_country_code', 
						'phone_city_code', 
						'phone_number'
						)
					->where('linkable_uid', $userId)
					->where('phone_type', 'mobile')
					->get();

		return json_decode(json_encode($result),true);
	}

	public function checkUniqCons($linkable_uid, $phone_country_code,$phone_city_code,$phone_number,$status = 'inactive'){
		$result = DB::table('phones')
					->select(
						'phone_type', 
						'phone_country_code', 
						'phone_city_code', 
						'phone_number'
						)
					->where('linkable_uid', $linkable_uid)
					->where('phone_country_code', $phone_country_code)
					->where('phone_city_code', $phone_city_code)
					->where('phone_number', $phone_number)
					->get();
		return json_decode(json_encode($result),true);
	}
} // end of class
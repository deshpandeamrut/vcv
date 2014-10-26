<?php

class Addresses extends Eloquent{
	protected $table = 'addresses';

	public function addUpdateAddress($data){
		$landmarks ='';
		$others ='';
		$userId = $data['user_id'];
		if(array_key_exists('landmarks',$data))
			$landmarks = (empty($data['landmarks'])? NULL: $data['landmarks']);	
		if(array_key_exists('other',$data))
			$others = (empty($data['other'])? NULL: $data['other']) ;
		
		$userAddressData = $this->getAddressDetailsByUserId($userId);
		if(!(empty($userAddressData))){
			$id = DB::table('addresses')
						->where('linkable_uid', $userId)
						->update(array(
							'street_no' => $data['street_no'],
							'street_name' => $data['street_name'],
							'area' => $data['suburb'],
							'landmarks' => $landmarks,
							'other'=>$others,
							'postcode'=>$data['postcode'],
							'city_name'=>$data['city_name'],
							'state_name'=>$data['state_name'],
							'address_type'=>$data['address_type'],
							'updated_at'=>date('Y-m-d H:i:s'),
							'updated_by'=>$data['email_id']
						));
		
		}else{
			$id = DB::table('addresses')->insertGetId(array(
								'linkable_uid'=>$userId,
								'street_no' => $data['street_no'],
								'street_name' => $data['street_name'],
								'area' => $data['suburb'],
								'landmarks' => $landmarks,
								'other'=>$others,
								'postcode'=>$data['postcode'],
								'city_name'=>$data['city_name'],
								'state_name'=>$data['state_name'],
								'address_type'=>$data['address_type'],
								'updated_at'=>date('Y-m-d H:i:s'),
								'created_by'=>$data['email_id'],
								'updated_by'=>$data['email_id']
							));
		}
		return $id;
		
	} // End of function addUpdateAddress

	public function getAddressDetailsByUserId($userId){
		$result = DB::table('addresses')
					->select(
						'street_no', 
						'street_name', 
						'area',
						'landmarks', 
						'other', 
						'postcode', 
						'city_name', 
						'state_name', 
						'country_name'
						)
					->where('linkable_uid', $userId)
					->where('address_type', 'user')
					->get();
		return json_decode(json_encode($result),true);

	} // end of function getAddressDetailsByUserId

} // end of class


<?php

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = array('password');

	/**
	 * Get the unique identifier for the user.
	 *
	 * @return mixed
	 */
	public function getAuthIdentifier()
	{
		return $this->getKey();
	}

	/**
	 * Get the password for the user.
	 *
	 * @return string
	 */
	public function getAuthPassword()
	{
		return $this->password;
	}

	/**
	 * Get the token value for the "remember me" session.
	 *
	 * @return string
	 */
	public function getRememberToken()
	{
		return $this->remember_token;
	}

	/**
	 * Set the token value for the "remember me" session.
	 *
	 * @param  string  $value
	 * @return void
	 */
	public function setRememberToken($value)
	{
		$this->remember_token = $value;
	}

	/**
	 * Get the column name for the "remember me" token.
	 *
	 * @return string
	 */
	public function getRememberTokenName()
	{
		return 'remember_token';
	}

	/**
	 * Get the e-mail address where password reminders are sent.
	 *
	 * @return string
	 */
	public function getReminderEmail()
	{
		return $this->email;
	}

	public function updateUserDetails($data){
		$result = DB::table('users')
					->where('id', $data['user_id'])
					->update(array(
								'title' => $data['title'],
								'first_name' => $data['first_name'],
								'middle_name' => $data['middle_name'],
								'last_name' => $data['last_name'],
								'is_profile_complete' => $data['is_profile_complete'],
								'dob' => date('Y-m-d',strtotime($data['dob'])),
								'updated_at' => date('Y-m-d H:i:s'),
								'updated_by' => $data['email_id'],
						));

		return $result;
	}

	public function getBasicDetailsByUserId($userId){
		$result = DB::table('users')
					->where('id', $userId)
					->select( 'title', 
							  'first_name',
							  'profile_rating', 
							  'middle_name', 
							  'last_name', 
							  'dob', 
							  'email', 'username', 
							  'user_type',
							  'membership_type'
							 )
					->get();
		if(empty($result)){
			return '';
		}
		else{
			return $result;
		}
	}

}
<?php
App::uses('AppController', 'Controller');
/**
 * Posts Controller
 *
 * @property Post $Post
 */
class PostsController extends AppController {

/**
 * Helpers
 *
 * @var array
 */
	public $helpers = array('Js');

	function index() {
		$this->set('posts', $this->Post->find('all'));
	}
	
	function add() {
	}
}

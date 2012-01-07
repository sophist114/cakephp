<?php
class MenuComponent extends Component {
	function show() {
		$list = array(
			'Languages' => array(
				'English' => array(
					'American',
					'Canadian',
					'British',
				),
				'Spanish',
				'German',
			)
		);
	return $this->Html->nestedList($list);
	}
}
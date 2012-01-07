<?php
echo $this->Html->css('form');
echo $this->Form->create('Post', array('type' => 'post'));
echo $this->Form->input('password'); // No div, no label
echo $this->Form->input('username', array('label' => 'Username')); // has a label element
echo $this->Form->end();
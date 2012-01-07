<?php
echo $this->Html->css('form');
echo $this->Form->create('Post', array('type' => 'post'));
echo $this->Form->input('title', array('label' => 'Title')); 
echo $this->Form->input('body',array('label'=>'Body','type'=>'tag'));
echo $this->Form->input('create',array('type'=>'hidden'));
echo $this->Form->input('update',array('type'=>'hidden'));
echo $this->Form->submit('submit');
echo $this->Html->link('Back',array('controller'=>'posts','action'=>'index'));
echo $this->Form->end();
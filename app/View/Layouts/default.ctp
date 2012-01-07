<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<?php echo $this->Html->charset(); ?>
	<title>
		<?php echo 'My Demo'; ?>
	</title>
	<?php
		echo $this->Html->meta('icon');

		echo $this->Html->css('default');

		echo $scripts_for_layout;
	?>
</head>
<body>
	<div id="container">
		<div id="header">
			<?php echo $this->Html->script('jquery'); ?>
			<div id="menu">
				<?php
					echo $this->Html->link('Home', array( 'controller' => 'home', 'action' => 'index')).' ';
					echo $this->Html->link('Customers', array( 'controller' => 'customers', 'action' => 'index')).' ';
					echo $this->Html->link('Posts', array( 'controller' => 'posts', 'action' => 'index')).' ';
					echo $this->Html->link('DCA', array( 'controller' => 'dca', 'action' => 'index')).' ';
				?>
			</div>
		</div>
		<div id="content">

			<?php echo $this->Session->flash(); ?>

			<?php echo $content_for_layout; ?>

		</div>
		<div id="footer">
			<?php
				echo 'Powered by Sophist Wu';
			?>
		</div>
	</div>
</body>
</html>
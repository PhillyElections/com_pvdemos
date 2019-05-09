<?php
/**
 * Admin bootstrap file for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */

defined('_JEXEC') or die('Restricted access');

// including debugger -- remove me
jimport('kint.kint');

// Uzer -- our cheap and dirty backend ACL enforcer
jimport('uzer.Uzer');
Uzer::blok(JFactory::getUser(), 'Manager');

// Instantiate any language files if any
$language = JFactory::getLanguage();
$language->load(JRequest::getCmd('option'), JPATH_SITE);

// Require the base controller
require_once JPATH_COMPONENT . DS . 'controller.php';

// Require specific controller if requested
if ($controller = JRequest::getWord('controller', 'events')) {
    $path = JPATH_COMPONENT . DS . 'controllers' . DS . $controller . '.php';
    if (file_exists($path)) {
        require_once $path;
    } else {
        $controller = '';
    }
}

// Create the controller
$classname = 'PvdemosController' . ucfirst($controller);

$controller = new $classname();

// Perform the Request task
$controller->execute(JRequest::getVar('task'));

// Redirect if set by the controller
$controller->redirect();

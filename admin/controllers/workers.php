<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Workers Controller for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosControllerWorkers extends PvdemosController
{
    /**
     * Display the Workers View
     * @return void
     */
    public function display()
    {
        JRequest::setVar('view', 'workers');

        parent::display();
    }

    /**
     * Redirect Edit task to Item Controller
     * @return void
     */
    public function edit()
    {
        $mainframe = JFactory::getApplication();
        $cid       = JRequest::getVar('cid');
        $mainframe->redirect('index.php?option=com_pvdemos&controller=worker&task=edit&cid=' . $cid[0]);
    }

    public function publish()
    {
        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('Workers');
        $model->publish();
        $this->display();
    }

    public function unpublish()
    {
        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('Workers');
        $model->unpublish();
        $this->display();
    }
}

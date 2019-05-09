<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Tasks Controller for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosControllerTasks extends PvdemosController
{
    /**
     * Display the Tasks View
     * @return void
     */
    public function display()
    {
        JRequest::setVar('view', 'tasks');

        parent::display();
    }

    /**
     * Redirect Edit task to Task Controller
     * @return void
     */
    public function edit()
    {
        $mainframe = JFactory::getApplication();
        $cid       = JRequest::getVar('cid');
        $mainframe->redirect('index.php?option=com_pvdemos&controller=task&task=edit&cid=' . $cid[0]);
    }

    public function publish()
    {
        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('Tasks');
        $model->publish();
        $this->display();
    }

    public function unpublish()
    {
        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('Tasks');
        $model->unpublish();
        $this->display();
    }
}

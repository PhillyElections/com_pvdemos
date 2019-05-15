<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Events Controller for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosControllerEvents extends PvdemosController
{
    /**
     * Display the Events View
     * @return void
     */
    public function display()
    {
        // if 'raw' isn't explicit, set to 'html'
        $view = $this->getView('events', JRequest::getWord('format', 'html'));
        $view->setModel($this->getModel('Events'), true);
        $view->setModel($this->getModel('Workers'), true);

        JRequest::setVar('view', 'events');

        parent::display();
    }

    /**
     * Redirect Edit task to Event Controller
     * @return void
     */
    public function edit()
    {
        $mainframe = JFactory::getApplication();
        $cid       = JRequest::getVar('cid');
        $mainframe->redirect('index.php?option=com_pvdemos&controller=event&task=edit&cid=' . $cid[0]);
    }

    public function publish()
    {
        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('Events');
        $model->publish();
        $this->display();
    }

    public function unpublish()
    {
        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('Events');
        $model->unpublish();
        $this->display();
    }
}

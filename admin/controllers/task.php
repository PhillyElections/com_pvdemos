<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Task Controller for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosControllerTask extends PvdemosController
{
    /**
     * Bind tasks to methods
     * @return void
     */
    public function __construct()
    {
        parent::__construct();

        // Register Extra tasks
        $this->registerTask('add', 'edit');
        $this->registerTask('update', 'save');
    }

    /**
     * Display the edit form
     * @return void
     */
    public function edit()
    {
        JRequest::setVar('view', 'task');

        parent::display();
    }

    /**
     * Save a record (and redirect to main page)
     *
     * @return void
     */
    public function save()
    {

        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('task');
        $post  = JRequest::get('post');

        if ($model->store($post)) {
            $msg = JText::_('Saved!');
        } else {
            // let's grab all those errors and make them available to the view
            JRequest::setVar('msg', $model->getErrors());

            return $this->edit();
        }

        // Let's go back to the default view
        $link = 'index.php?option=com_pvdemos';

        $this->setRedirect($link, $msg);
    }

    /**
     * Remove record(s)
     * @return void
     */
    public function remove()
    {
        JRequest::checkToken() or jexit('Invalid Token');

        $model = $this->getModel('task');
        if (!$model->delete()) {
            $msg = JText::_('Error: One or More Tasks Could not be Deleted');
        } else {
            $msg = JText::_('Tasks(s) Deleted');
        }

        $this->setRedirect('index.php?option=com_pvdemos', $msg);
    }

    /**
     * Cancel editing a record
     * @return void
     */
    public function cancel()
    {
        $msg = JText::_('Operation Cancelled');

        $this->setRedirect('index.php?option=com_pvdemos', $msg);
    }
}
